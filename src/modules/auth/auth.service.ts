import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../../config/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AppConfigService } from '../../config/app-config.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService,
  ) {}

  async login(payload: LoginDto) {
    const normalizedEmail = payload.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        adminProfile: true,
        teacherProfile: true,
        studentProfile: true,
      },
    });

    if (!user || !user.isActive || !(await argon2.verify(user.passwordHash, payload.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.createSession(this.prisma, user);
  }

  async register(payload: RegisterDto) {
    const normalizedEmail = payload.email.trim().toLowerCase();
    const normalizedSchoolCode = payload.schoolCode.trim().toUpperCase();

    const [existingUser, school] = await Promise.all([
      this.prisma.user.findUnique({ where: { email: normalizedEmail } }),
      this.prisma.school.findUnique({ where: { code: normalizedSchoolCode } }),
    ]);

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    if (!school) {
      throw new BadRequestException('School code is invalid');
    }

    const section = await this.prisma.section.findFirst({
      where: { schoolId: school.id },
      include: { academicClass: true },
      orderBy: { createdAt: 'asc' },
    });

    if (!section) {
      throw new BadRequestException('School onboarding is not configured yet');
    }

    const existingStudents = await this.prisma.student.count({
      where: { sectionId: section.id },
    });

    const year = new Date().getFullYear();
    const serial = String(existingStudents + 1).padStart(2, '0');
    const admissionNo = `${school.code}-${year}-${Date.now().toString().slice(-5)}`;
    const rollNumber = `${section.academicClass.gradeLevel}${section.name}${serial}`;
    const usn = `${school.code}${String(year).slice(-2)}${section.name}${serial}`;
    const passwordHash = await argon2.hash(payload.password);

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role: UserRole.STUDENT,
        lastLoginAt: new Date(),
        studentProfile: {
          create: {
            schoolId: school.id,
            sectionId: section.id,
            admissionNo,
            rollNumber,
            usn,
            firstName: payload.firstName.trim(),
            lastName: payload.lastName.trim(),
          },
        },
      },
      include: {
        adminProfile: true,
        teacherProfile: true,
        studentProfile: true,
      },
    });

    const createdStudent = await this.prisma.student.findUniqueOrThrow({
      where: { userId: user.id },
      select: { id: true },
    });

    const activeTerm = await this.prisma.academicTerm.findFirst({
      where: {
        schoolId: school.id,
        classId: section.classId,
        isActive: true,
      },
      orderBy: { startDate: 'desc' },
    });

    if (activeTerm) {
      await this.prisma.enrollment.create({
        data: {
          studentId: createdStudent.id,
          sectionId: section.id,
          termId: activeTerm.id,
        },
      });
    }

    return this.createSession(this.prisma, user);
  }

  async resetPassword(payload: ResetPasswordDto) {
    const normalizedEmail = payload.email.trim().toLowerCase();
    const normalizedSchoolCode = payload.schoolCode.trim().toUpperCase();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        adminProfile: true,
        teacherProfile: true,
        studentProfile: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Account details are invalid');
    }

    const schoolId =
      user.adminProfile?.schoolId ?? user.teacherProfile?.schoolId ?? user.studentProfile?.schoolId ?? null;

    if (!schoolId) {
      throw new BadRequestException('Account details are invalid');
    }

    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: { code: true },
    });

    if (!school || school.code !== normalizedSchoolCode) {
      throw new BadRequestException('Account details are invalid');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await argon2.hash(payload.password) },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return {
      message: 'Password reset successful. Sign in with your new password.',
    };
  }

  async refreshTokens({ refreshToken }: RefreshTokenDto) {
    const payload = await this.jwtService.verifyAsync<{
      sub: string;
      email: string;
      role: string;
      profileId?: string;
      schoolId?: string;
    }>(refreshToken, {
      secret: this.configService.jwtRefreshSecret,
    });

    const matchedToken = await this.findActiveRefreshToken(payload.sub, refreshToken);

    if (!matchedToken) {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    const user = await this.getSessionUser(payload.sub);

    return this.prisma.$transaction(async (tx) => {
      await tx.refreshToken.updateMany({
        where: { id: matchedToken.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      await this.cleanupRefreshTokens(tx, user.id);

      return this.createSession(tx, user);
    });
  }

  async logout({ refreshToken }: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(refreshToken, {
        secret: this.configService.jwtRefreshSecret,
      });

      const matchedToken = await this.findActiveRefreshToken(payload.sub, refreshToken);

      if (matchedToken) {
        await this.prisma.refreshToken.updateMany({
          where: { id: matchedToken.id, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
    } catch {
      // Logout is intentionally idempotent so the client can always clear local state.
    }

    return { message: 'Signed out successfully.' };
  }

  private async getSessionUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        adminProfile: true,
        teacherProfile: true,
        studentProfile: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Account is unavailable');
    }

    return user;
  }

  private async findActiveRefreshToken(userId: string, refreshToken: string) {
    const tokens = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    for (const token of tokens) {
      if (await argon2.verify(token.tokenHash, refreshToken)) {
        return token;
      }
    }

    return null;
  }

  private async cleanupRefreshTokens(db: Prisma.TransactionClient | PrismaService, userId: string) {
    await db.refreshToken.deleteMany({
      where: {
        userId,
        OR: [{ revokedAt: { not: null } }, { expiresAt: { lte: new Date() } }],
      },
    });
  }

  private async createSession(
    db: Prisma.TransactionClient | PrismaService,
    user: {
    id: string;
    email: string;
    role: string;
    adminProfile?: { id: string; schoolId: string } | null;
    teacherProfile?: { id: string; schoolId: string } | null;
    studentProfile?: { id: string; schoolId: string } | null;
  },
  ) {
    const profileId = user.adminProfile?.id ?? user.teacherProfile?.id ?? user.studentProfile?.id;
    const schoolId =
      user.adminProfile?.schoolId ?? user.teacherProfile?.schoolId ?? user.studentProfile?.schoolId ?? undefined;

    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      profileId,
      schoolId,
    };

    const accessToken = await this.jwtService.signAsync(tokenPayload, {
      secret: this.configService.jwtAccessSecret,
      expiresIn: this.configService.jwtAccessTtl,
    });

    const refreshToken = await this.jwtService.signAsync(tokenPayload, {
      secret: this.configService.jwtRefreshSecret,
      expiresIn: this.configService.jwtRefreshTtl,
    });

    const refreshTtlMs = 7 * 24 * 60 * 60 * 1000;

    await db.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: await argon2.hash(refreshToken),
        expiresAt: new Date(Date.now() + refreshTtlMs),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profileId,
        schoolId,
      },
    };
  }
}
