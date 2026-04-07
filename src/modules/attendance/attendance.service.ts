import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AttendanceStatus } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { AppConfigService } from '../../config/app-config.service';
import { UpsertAttendanceDto } from './dto/upsert-attendance.dto';
import { AttendanceQueryDto } from './dto/attendance-query.dto';

const ATTENDED_STATUSES: AttendanceStatus[] = [
  AttendanceStatus.PRESENT,
  AttendanceStatus.LATE,
  AttendanceStatus.EXCUSED,
];

function isAttendedStatus(status: AttendanceStatus) {
  return ATTENDED_STATUSES.some((attendedStatus) => attendedStatus === status);
}

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: AppConfigService,
  ) {}

  private createUtcDateRange(dateInput: string) {
    const start = new Date(`${dateInput}T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    return { start, end };
  }

  async upsertAttendance(teacherId: string, payload: UpsertAttendanceDto) {
    const assignment = await this.prisma.teacherSubjectAssignment.findFirst({
      where: {
        teacherId,
        sectionId: payload.sectionId,
        subjectId: payload.subjectId,
      },
    });

    if (!assignment) {
      throw new ForbiddenException('You are not assigned to this class and subject');
    }

    const session = await this.prisma.attendanceSession.upsert({
      where: {
        sectionId_subjectId_date_slotNumber: {
          sectionId: payload.sectionId,
          subjectId: payload.subjectId,
          date: new Date(payload.date),
          slotNumber: payload.slotNumber,
        },
      },
      update: {
        slotNumber: payload.slotNumber,
        hourLabel: payload.hourLabel ?? `Hour ${payload.slotNumber}`,
        termId: payload.termId,
        subjectOfferingId: assignment.subjectOfferingId,
        submittedAt: new Date(),
      },
      create: {
        sectionId: payload.sectionId,
        subjectId: payload.subjectId,
        teacherId,
        subjectOfferingId: assignment.subjectOfferingId,
        termId: payload.termId,
        date: new Date(payload.date),
        slotNumber: payload.slotNumber,
        hourLabel: payload.hourLabel ?? `Hour ${payload.slotNumber}`,
        submittedAt: new Date(),
      },
    });

    await this.prisma.$transaction(
      payload.records.map((record) =>
        this.prisma.attendance.upsert({
          where: {
            attendanceSessionId_studentId: {
              attendanceSessionId: session.id,
              studentId: record.studentId,
            },
          },
          update: {
            status: record.status,
            remark: record.remark,
            markedAt: new Date(),
          },
          create: {
            attendanceSessionId: session.id,
            studentId: record.studentId,
            status: record.status,
            remark: record.remark,
          },
        }),
      ),
    );

    return this.prisma.attendanceSession.findUniqueOrThrow({
      where: { id: session.id },
      include: {
        subject: true,
        section: {
          include: {
            academicClass: true,
          },
        },
        records: {
          include: {
            student: true,
          },
        },
      },
    });
  }

  async getTeacherAttendanceSessions(teacherId: string, query: AttendanceQueryDto) {
    const dateRange = query.date ? this.createUtcDateRange(query.date) : null;

    return this.prisma.attendanceSession.findMany({
      where: {
        teacherId,
        sectionId: query.sectionId,
        subjectId: query.subjectId,
        date: {
          gte: dateRange?.start ?? (query.from ? new Date(query.from) : undefined),
          lt: dateRange?.end,
          lte: dateRange ? undefined : query.to ? new Date(query.to) : undefined,
        },
      },
      include: {
        subject: true,
        section: true,
        records: true,
      },
      orderBy: [{ date: 'desc' }, { slotNumber: 'asc' }],
    });
  }

  async getTeacherWorkspace(teacherId: string) {
    const assignments = await this.prisma.teacherSubjectAssignment.findMany({
      where: { teacherId },
      include: {
        academicClass: true,
        section: {
          include: {
            students: {
              select: { id: true },
            },
            department: true,
            semester: true,
          },
        },
        subject: true,
      },
      orderBy: [{ academicClass: { gradeLevel: 'asc' } }, { section: { name: 'asc' } }],
    });

    const recentSessions = await this.prisma.attendanceSession.findMany({
      where: { teacherId },
      include: {
        section: true,
        subject: true,
        records: true,
      },
      orderBy: { date: 'desc' },
      take: 10,
    });

    return {
      assignments: assignments.map((assignment) => ({
        id: assignment.id,
        sectionId: assignment.sectionId,
        subjectId: assignment.subjectId,
        className: assignment.academicClass.name,
        sectionName: assignment.section.name,
        subjectName: assignment.subject.name,
        rosterSize: assignment.section.students.length,
      })),
      recentSessions: recentSessions.map((session) => ({
        id: session.id,
        date: session.date,
        slotNumber: session.slotNumber,
        hourLabel: session.hourLabel,
        sectionName: session.section.name,
        subjectName: session.subject.name,
        submissions: session.records.length,
      })),
    };
  }

  async getStudentAttendanceSummary(studentId: string, selectedDate?: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        department: true,
        section: {
          include: {
            academicClass: true,
            department: true,
            semester: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const attendance = await this.prisma.attendance.findMany({
      where: { studentId },
      include: {
        attendanceSession: {
          include: {
            subject: true,
          },
        },
      },
    });

    const total = attendance.length;
    const presentCount = attendance.filter((item) => isAttendedStatus(item.status)).length;
    const percentage = total === 0 ? 0 : Number(((presentCount / total) * 100).toFixed(1));
    const availableDates = Array.from(
      new Set(attendance.map((item) => item.attendanceSession.date.toISOString().slice(0, 10))),
    ).sort((left, right) => right.localeCompare(left));
    const resolvedDate = selectedDate && availableDates.includes(selectedDate) ? selectedDate : availableDates[0] ?? null;

    const subjectMap = new Map<string, { subjectId: string; subjectName: string; present: number; total: number }>();

    attendance.forEach((item) => {
      const subject = item.attendanceSession.subject;
      const current = subjectMap.get(subject.id) ?? {
        subjectId: subject.id,
        subjectName: subject.name,
        present: 0,
        total: 0,
      };

      current.total += 1;
      if (isAttendedStatus(item.status)) {
        current.present += 1;
      }

      subjectMap.set(subject.id, current);
    });

    const selectedDateRecords = resolvedDate
      ? attendance
          .filter((item) => item.attendanceSession.date.toISOString().slice(0, 10) === resolvedDate)
          .sort((left, right) => {
            const slotDelta = (left.attendanceSession.slotNumber ?? 0) - (right.attendanceSession.slotNumber ?? 0);
            if (slotDelta !== 0) {
              return slotDelta;
            }

            return left.attendanceSession.subject.name.localeCompare(right.attendanceSession.subject.name);
          })
      : [];

    return {
      student: {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        rollNumber: student.rollNumber,
        usn: student.usn,
        department: student.department?.shortName ?? student.section.department?.shortName ?? null,
        semester: student.currentSemester ?? student.section.semesterNumber ?? student.section.semester?.number ?? null,
        section: student.section.name,
        className: student.section.academicClass.name,
      },
      summary: {
        totalSessions: total,
        attendedSessions: presentCount,
        attendancePercentage: percentage,
        warningThreshold: this.configService.attendanceWarningThreshold,
        isBelowThreshold: percentage < this.configService.attendanceWarningThreshold,
      },
      selectedDate: resolvedDate,
      availableDates,
      subjectBreakdown: Array.from(subjectMap.values()).map((item) => ({
        ...item,
        percentage: item.total === 0 ? 0 : Number(((item.present / item.total) * 100).toFixed(1)),
      })),
      dailyTimeline: selectedDateRecords.map((item) => ({
        id: item.id,
        status: item.status,
        date: item.attendanceSession.date,
        subject: item.attendanceSession.subject.name,
        slotNumber: item.attendanceSession.slotNumber,
        hourLabel: item.attendanceSession.hourLabel ?? `Hour ${item.attendanceSession.slotNumber ?? '--'}`,
        remark: item.remark,
      })),
      recentRecords: attendance
        .sort((a, b) => {
          const dateDelta = b.attendanceSession.date.getTime() - a.attendanceSession.date.getTime();
          if (dateDelta !== 0) {
            return dateDelta;
          }

          return (a.attendanceSession.slotNumber ?? 0) - (b.attendanceSession.slotNumber ?? 0);
        })
        .slice(0, 10)
        .map((item) => ({
          id: item.id,
          status: item.status,
          date: item.attendanceSession.date,
          subject: item.attendanceSession.subject.name,
          slotNumber: item.attendanceSession.slotNumber,
          hourLabel: item.attendanceSession.hourLabel ?? `Hour ${item.attendanceSession.slotNumber ?? '--'}`,
          remark: item.remark,
        })),
    };
  }

  async getSectionRoster(sectionId: string) {
    if (!sectionId) {
      throw new NotFoundException('Section not found');
    }

    return this.prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        academicClass: true,
        students: {
          orderBy: { rollNumber: 'asc' },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rollNumber: true,
            usn: true,
          },
        },
      },
    });
  }

  async getTeacherRoster(teacherId: string, sectionId: string) {
    const assignment = await this.prisma.teacherSubjectAssignment.findFirst({
      where: {
        teacherId,
        sectionId,
      },
      select: { id: true },
    });

    if (!assignment) {
      throw new ForbiddenException('You are not assigned to this section');
    }

    return this.getSectionRoster(sectionId);
  }
}
