import test from 'node:test';
import assert from 'node:assert/strict';
import * as argon2 from 'argon2';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

type SessionUser = {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  passwordHash: string;
  adminProfile: { id: string; schoolId: string } | null;
  teacherProfile: { id: string; schoolId: string } | null;
  studentProfile: { id: string; schoolId: string } | null;
};

function createSessionUser(overrides: Partial<SessionUser> = {}): SessionUser {
  return {
    id: 'user-1',
    email: 'student@svit.edu',
    role: 'STUDENT',
    isActive: true,
    passwordHash: '',
    adminProfile: null,
    teacherProfile: null,
    studentProfile: { id: 'student-profile-1', schoolId: 'school-1' },
    ...overrides,
  };
}

function createMockPrisma() {
  const tx: any = {
    refreshToken: {
      updateMany: async (_payload?: unknown) => ({ count: 0 }),
      deleteMany: async (_payload?: unknown) => ({ count: 0 }),
      create: async (_payload?: unknown) => null,
    },
  };

  const root: any = {
    user: {
      findUnique: async () => null,
      update: async () => null,
    },
    refreshToken: {
      findMany: async () => [],
      updateMany: async () => ({ count: 0 }),
      deleteMany: async () => ({ count: 0 }),
      create: async () => null,
    },
    $transaction: async <T>(callback: (db: any) => Promise<T>) => callback(tx),
  };

  return { root, tx };
}

function createAuthService(options: {
  prisma: ReturnType<typeof createMockPrisma>['root'];
  verifyAsync?: (token: string, options?: unknown) => Promise<any>;
  signAsync?: (payload: unknown, options?: { secret?: string }) => Promise<string>;
}) {
  const jwtService = {
    verifyAsync:
      options.verifyAsync ??
      (async () => ({
        sub: 'user-1',
        email: 'student@svit.edu',
        role: 'STUDENT',
        profileId: 'student-profile-1',
        schoolId: 'school-1',
      })),
    signAsync:
      options.signAsync ??
      (async (_payload: unknown, signOptions?: { secret?: string }) =>
        signOptions?.secret === 'refresh-secret' ? 'new-refresh-token' : 'new-access-token'),
  };

  const configService = {
    jwtAccessSecret: 'access-secret',
    jwtRefreshSecret: 'refresh-secret',
    jwtAccessTtl: '15m',
    jwtRefreshTtl: '7d',
  };

  return new AuthService(options.prisma as never, jwtService as never, configService as never);
}

test('refreshTokens rotates the matched refresh token and returns a new session', async () => {
  const existingRefreshToken = 'refresh-token-1';
  const existingTokenHash = await argon2.hash(existingRefreshToken);
  const user = createSessionUser();
  const { root, tx } = createMockPrisma();
  const revokedTokenCalls: Array<{ where: unknown; data: unknown }> = [];
  const cleanupCalls: Array<{ where: unknown }> = [];
  const createdTokens: Array<{ userId: string; tokenHash: string; expiresAt: Date }> = [];

  root.refreshToken.findMany = async () => [
    {
      id: 'token-1',
      userId: user.id,
      tokenHash: existingTokenHash,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
    },
  ];
  root.user.findUnique = async () => user;
  tx.refreshToken.updateMany = async (payload: { where: unknown; data: unknown }) => {
    revokedTokenCalls.push(payload);
    return { count: 1 };
  };
  tx.refreshToken.deleteMany = async (payload: { where: unknown }) => {
    cleanupCalls.push(payload);
    return { count: 2 };
  };
  tx.refreshToken.create = async (payload: { data: { userId: string; tokenHash: string; expiresAt: Date } }) => {
    createdTokens.push(payload.data);
    return null;
  };

  const service = createAuthService({ prisma: root });

  const session = await service.refreshTokens({ refreshToken: existingRefreshToken });

  assert.equal(session.accessToken, 'new-access-token');
  assert.equal(session.refreshToken, 'new-refresh-token');
  assert.deepEqual(session.user, {
    id: user.id,
    email: user.email,
    role: user.role,
    profileId: 'student-profile-1',
    schoolId: 'school-1',
  });
  assert.equal(revokedTokenCalls.length, 1);
  assert.equal(cleanupCalls.length, 1);
  assert.equal(createdTokens.length, 1);
  assert.equal(createdTokens[0]?.userId, user.id);
  assert.ok(await argon2.verify(createdTokens[0]!.tokenHash, 'new-refresh-token'));
});

test('logout revokes the active refresh token without failing the client flow', async () => {
  const refreshToken = 'refresh-token-logout';
  const { root } = createMockPrisma();
  const revokedTokenCalls: Array<{ where: unknown; data: unknown }> = [];

  root.refreshToken.findMany = async () => [
    {
      id: 'token-logout',
      userId: 'user-1',
      tokenHash: await argon2.hash(refreshToken),
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
    },
  ];
  root.refreshToken.updateMany = async (payload: { where: unknown; data: unknown }) => {
    revokedTokenCalls.push(payload);
    return { count: 1 };
  };

  const service = createAuthService({ prisma: root });

  const response = await service.logout({ refreshToken });

  assert.deepEqual(response, { message: 'Signed out successfully.' });
  assert.equal(revokedTokenCalls.length, 1);
});

test('logout stays idempotent when the refresh token is already invalid', async () => {
  const { root } = createMockPrisma();

  const service = createAuthService({
    prisma: root,
    verifyAsync: async () => {
      throw new Error('invalid token');
    },
  });

  const response = await service.logout({ refreshToken: 'bad-token' });

  assert.deepEqual(response, { message: 'Signed out successfully.' });
});

test('login rejects inactive accounts before issuing a session', async () => {
  const password = 'Password@123';
  const user = createSessionUser({
    isActive: false,
    passwordHash: await argon2.hash(password),
  });
  const { root } = createMockPrisma();

  root.user.findUnique = async () => user;

  const service = createAuthService({ prisma: root });

  await assert.rejects(
    () => service.login({ email: user.email, password }),
    (error: unknown) => error instanceof UnauthorizedException,
  );
});
