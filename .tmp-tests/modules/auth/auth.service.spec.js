"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const argon2 = __importStar(require("argon2"));
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
function createSessionUser(overrides = {}) {
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
    const tx = {
        refreshToken: {
            updateMany: async (_payload) => ({ count: 0 }),
            deleteMany: async (_payload) => ({ count: 0 }),
            create: async (_payload) => null,
        },
    };
    const root = {
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
        $transaction: async (callback) => callback(tx),
    };
    return { root, tx };
}
function createAuthService(options) {
    const jwtService = {
        verifyAsync: options.verifyAsync ??
            (async () => ({
                sub: 'user-1',
                email: 'student@svit.edu',
                role: 'STUDENT',
                profileId: 'student-profile-1',
                schoolId: 'school-1',
            })),
        signAsync: options.signAsync ??
            (async (_payload, signOptions) => signOptions?.secret === 'refresh-secret' ? 'new-refresh-token' : 'new-access-token'),
    };
    const configService = {
        jwtAccessSecret: 'access-secret',
        jwtRefreshSecret: 'refresh-secret',
        jwtAccessTtl: '15m',
        jwtRefreshTtl: '7d',
    };
    return new auth_service_1.AuthService(options.prisma, jwtService, configService);
}
(0, node_test_1.default)('refreshTokens rotates the matched refresh token and returns a new session', async () => {
    const existingRefreshToken = 'refresh-token-1';
    const existingTokenHash = await argon2.hash(existingRefreshToken);
    const user = createSessionUser();
    const { root, tx } = createMockPrisma();
    const revokedTokenCalls = [];
    const cleanupCalls = [];
    const createdTokens = [];
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
    tx.refreshToken.updateMany = async (payload) => {
        revokedTokenCalls.push(payload);
        return { count: 1 };
    };
    tx.refreshToken.deleteMany = async (payload) => {
        cleanupCalls.push(payload);
        return { count: 2 };
    };
    tx.refreshToken.create = async (payload) => {
        createdTokens.push(payload.data);
        return null;
    };
    const service = createAuthService({ prisma: root });
    const session = await service.refreshTokens({ refreshToken: existingRefreshToken });
    strict_1.default.equal(session.accessToken, 'new-access-token');
    strict_1.default.equal(session.refreshToken, 'new-refresh-token');
    strict_1.default.deepEqual(session.user, {
        id: user.id,
        email: user.email,
        role: user.role,
        profileId: 'student-profile-1',
        schoolId: 'school-1',
    });
    strict_1.default.equal(revokedTokenCalls.length, 1);
    strict_1.default.equal(cleanupCalls.length, 1);
    strict_1.default.equal(createdTokens.length, 1);
    strict_1.default.equal(createdTokens[0]?.userId, user.id);
    strict_1.default.ok(await argon2.verify(createdTokens[0].tokenHash, 'new-refresh-token'));
});
(0, node_test_1.default)('logout revokes the active refresh token without failing the client flow', async () => {
    const refreshToken = 'refresh-token-logout';
    const { root } = createMockPrisma();
    const revokedTokenCalls = [];
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
    root.refreshToken.updateMany = async (payload) => {
        revokedTokenCalls.push(payload);
        return { count: 1 };
    };
    const service = createAuthService({ prisma: root });
    const response = await service.logout({ refreshToken });
    strict_1.default.deepEqual(response, { message: 'Signed out successfully.' });
    strict_1.default.equal(revokedTokenCalls.length, 1);
});
(0, node_test_1.default)('logout stays idempotent when the refresh token is already invalid', async () => {
    const { root } = createMockPrisma();
    const service = createAuthService({
        prisma: root,
        verifyAsync: async () => {
            throw new Error('invalid token');
        },
    });
    const response = await service.logout({ refreshToken: 'bad-token' });
    strict_1.default.deepEqual(response, { message: 'Signed out successfully.' });
});
(0, node_test_1.default)('login rejects inactive accounts before issuing a session', async () => {
    const password = 'Password@123';
    const user = createSessionUser({
        isActive: false,
        passwordHash: await argon2.hash(password),
    });
    const { root } = createMockPrisma();
    root.user.findUnique = async () => user;
    const service = createAuthService({ prisma: root });
    await strict_1.default.rejects(() => service.login({ email: user.email, password }), (error) => error instanceof common_1.UnauthorizedException);
});
