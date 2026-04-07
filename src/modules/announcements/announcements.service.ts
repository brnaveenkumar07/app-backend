import { ForbiddenException, Injectable } from '@nestjs/common';
import { AnnouncementAudience, UserRole } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(user: { role: UserRole; profileId?: string; schoolId?: string }) {
    if (!user.schoolId) {
      return [];
    }

    if (user.role === UserRole.STUDENT) {
      const student = await this.prisma.student.findUnique({
        where: { id: user.profileId },
        select: { sectionId: true },
      });

      return this.prisma.announcement.findMany({
        where: {
          schoolId: user.schoolId,
          OR: [
            { audience: AnnouncementAudience.SCHOOL },
            { audience: AnnouncementAudience.ROLE, audienceRole: UserRole.STUDENT },
            { audience: AnnouncementAudience.SECTION, sectionId: student?.sectionId },
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

    if (user.role === UserRole.TEACHER) {
      const assignments = await this.prisma.teacherSubjectAssignment.findMany({
        where: { teacherId: user.profileId },
        select: { sectionId: true },
      });

      return this.prisma.announcement.findMany({
        where: {
          schoolId: user.schoolId,
          OR: [
            { audience: AnnouncementAudience.SCHOOL },
            { audience: AnnouncementAudience.ROLE, audienceRole: UserRole.TEACHER },
            { audience: AnnouncementAudience.SECTION, sectionId: { in: assignments.map((item) => item.sectionId) } },
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

  async create(actor: { role: UserRole; profileId?: string; schoolId?: string }, payload: CreateAnnouncementDto) {
    if (!actor.schoolId) {
      throw new ForbiddenException('School context is required');
    }

    if (actor.role === UserRole.TEACHER && payload.audience !== AnnouncementAudience.SECTION) {
      throw new ForbiddenException('Teachers can publish section announcements only');
    }

    if (actor.role === UserRole.TEACHER && !payload.sectionId) {
      throw new ForbiddenException('Section is required for teacher announcements');
    }

    const announcement = await this.prisma.announcement.create({
      data: {
        schoolId: actor.schoolId,
        teacherId: actor.role === UserRole.TEACHER ? actor.profileId : undefined,
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

  private async resolveAudienceRecipients(schoolId: string, payload: CreateAnnouncementDto) {
    if (payload.audience === AnnouncementAudience.SCHOOL) {
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

    if (payload.audience === AnnouncementAudience.ROLE && payload.audienceRole) {
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
}
