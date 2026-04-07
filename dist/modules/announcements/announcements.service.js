"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../config/prisma.service");
let AnnouncementsService = class AnnouncementsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listForUser(user) {
        if (!user.schoolId) {
            return [];
        }
        if (user.role === client_1.UserRole.STUDENT) {
            const student = await this.prisma.student.findUnique({
                where: { id: user.profileId },
                select: { sectionId: true },
            });
            return this.prisma.announcement.findMany({
                where: {
                    schoolId: user.schoolId,
                    OR: [
                        { audience: client_1.AnnouncementAudience.SCHOOL },
                        { audience: client_1.AnnouncementAudience.ROLE, audienceRole: client_1.UserRole.STUDENT },
                        { audience: client_1.AnnouncementAudience.SECTION, sectionId: student?.sectionId },
                    ],
                    publishedAt: { not: null },
                },
                include: {
                    teacher: true,
                    section: true,
                },
                orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
            });
        }
        if (user.role === client_1.UserRole.TEACHER) {
            const assignments = await this.prisma.teacherSubjectAssignment.findMany({
                where: { teacherId: user.profileId },
                select: { sectionId: true },
            });
            return this.prisma.announcement.findMany({
                where: {
                    schoolId: user.schoolId,
                    OR: [
                        { audience: client_1.AnnouncementAudience.SCHOOL },
                        { audience: client_1.AnnouncementAudience.ROLE, audienceRole: client_1.UserRole.TEACHER },
                        { audience: client_1.AnnouncementAudience.SECTION, sectionId: { in: assignments.map((item) => item.sectionId) } },
                    ],
                    publishedAt: { not: null },
                },
                include: {
                    teacher: true,
                    section: true,
                },
                orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
            });
        }
        return this.prisma.announcement.findMany({
            where: { schoolId: user.schoolId },
            include: {
                teacher: true,
                section: true,
            },
            orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        });
    }
    async create(actor, payload) {
        if (!actor.schoolId) {
            throw new common_1.ForbiddenException('School context is required');
        }
        if (actor.role === client_1.UserRole.TEACHER && payload.audience !== client_1.AnnouncementAudience.SECTION) {
            throw new common_1.ForbiddenException('Teachers can publish section announcements only');
        }
        if (actor.role === client_1.UserRole.TEACHER && !payload.sectionId) {
            throw new common_1.ForbiddenException('Section is required for teacher announcements');
        }
        const announcement = await this.prisma.announcement.create({
            data: {
                schoolId: actor.schoolId,
                teacherId: actor.role === client_1.UserRole.TEACHER ? actor.profileId : undefined,
                sectionId: payload.sectionId,
                title: payload.title,
                content: payload.content,
                audience: payload.audience,
                audienceRole: payload.audienceRole,
                expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : undefined,
                publishedAt: new Date(),
            },
            include: {
                teacher: true,
                section: true,
            },
        });
        const recipientIds = await this.resolveAudienceRecipients(actor.schoolId, payload);
        if (recipientIds.length) {
            await this.prisma.notification.createMany({
                data: recipientIds.map((userId) => ({
                    userId,
                    title: announcement.title,
                    body: announcement.content,
                    announcementId: announcement.id,
                    data: {
                        audience: payload.audience,
                        sectionId: payload.sectionId,
                    },
                })),
            });
        }
        return announcement;
    }
    async resolveAudienceRecipients(schoolId, payload) {
        if (payload.audience === client_1.AnnouncementAudience.SCHOOL) {
            const users = await this.prisma.user.findMany({
                where: {
                    OR: [
                        { adminProfile: { schoolId } },
                        { teacherProfile: { schoolId } },
                        { studentProfile: { schoolId } },
                    ],
                },
                select: { id: true },
            });
            return users.map((user) => user.id);
        }
        if (payload.audience === client_1.AnnouncementAudience.ROLE && payload.audienceRole) {
            const users = await this.prisma.user.findMany({
                where: {
                    role: payload.audienceRole,
                    OR: [
                        { adminProfile: { schoolId } },
                        { teacherProfile: { schoolId } },
                        { studentProfile: { schoolId } },
                    ],
                },
                select: { id: true },
            });
            return users.map((user) => user.id);
        }
        if (payload.sectionId) {
            const users = await this.prisma.user.findMany({
                where: {
                    studentProfile: {
                        sectionId: payload.sectionId,
                    },
                },
                select: { id: true },
            });
            return users.map((user) => user.id);
        }
        return [];
    }
};
exports.AnnouncementsService = AnnouncementsService;
exports.AnnouncementsService = AnnouncementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnnouncementsService);
