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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_1 = require("@nestjs/jwt");
const argon2 = __importStar(require("argon2"));
const prisma_service_1 = require("../../config/prisma.service");
const app_config_service_1 = require("../../config/app-config.service");
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async login(payload) {
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
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        return this.createSession(this.prisma, user);
    }
    async register(payload) {
        const normalizedEmail = payload.email.trim().toLowerCase();
        const normalizedSchoolCode = payload.schoolCode.trim().toUpperCase();
        const [existingUser, school] = await Promise.all([
            this.prisma.user.findUnique({ where: { email: normalizedEmail } }),
            this.prisma.school.findUnique({ where: { code: normalizedSchoolCode } }),
        ]);
        if (existingUser) {
            throw new common_1.ConflictException('An account with this email already exists');
        }
        if (!school) {
            throw new common_1.BadRequestException('School code is invalid');
        }
        const section = await this.prisma.section.findFirst({
            where: { schoolId: school.id },
            include: { academicClass: true },
            orderBy: { createdAt: 'asc' },
        });
        if (!section) {
            throw new common_1.BadRequestException('School onboarding is not configured yet');
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
                role: client_1.UserRole.STUDENT,
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
    async resetPassword(payload) {
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
            throw new common_1.BadRequestException('Account details are invalid');
        }
        const schoolId = user.adminProfile?.schoolId ?? user.teacherProfile?.schoolId ?? user.studentProfile?.schoolId ?? null;
        if (!schoolId) {
            throw new common_1.BadRequestException('Account details are invalid');
        }
        const school = await this.prisma.school.findUnique({
            where: { id: schoolId },
            select: { code: true },
        });
        if (!school || school.code !== normalizedSchoolCode) {
            throw new common_1.BadRequestException('Account details are invalid');
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
    async refreshTokens({ refreshToken }) {
        const payload = await this.jwtService.verifyAsync(refreshToken, {
            secret: this.configService.jwtRefreshSecret,
        });
        const matchedToken = await this.findActiveRefreshToken(payload.sub, refreshToken);
        if (!matchedToken) {
            throw new common_1.UnauthorizedException('Refresh token is invalid');
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
    async logout({ refreshToken }) {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.jwtRefreshSecret,
            });
            const matchedToken = await this.findActiveRefreshToken(payload.sub, refreshToken);
            if (matchedToken) {
                await this.prisma.refreshToken.updateMany({
                    where: { id: matchedToken.id, revokedAt: null },
                    data: { revokedAt: new Date() },
                });
            }
        }
        catch {
            // Logout is intentionally idempotent so the client can always clear local state.
        }
        return { message: 'Signed out successfully.' };
    }
    async getSessionUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                adminProfile: true,
                teacherProfile: true,
                studentProfile: true,
            },
        });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('Account is unavailable');
        }
        return user;
    }
    async findActiveRefreshToken(userId, refreshToken) {
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
    async cleanupRefreshTokens(db, userId) {
        await db.refreshToken.deleteMany({
            where: {
                userId,
                OR: [{ revokedAt: { not: null } }, { expiresAt: { lte: new Date() } }],
            },
        });
    }
    async createSession(db, user) {
        const profileId = user.adminProfile?.id ?? user.teacherProfile?.id ?? user.studentProfile?.id;
        const schoolId = user.adminProfile?.schoolId ?? user.teacherProfile?.schoolId ?? user.studentProfile?.schoolId ?? undefined;
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        app_config_service_1.AppConfigService])
], AuthService);
