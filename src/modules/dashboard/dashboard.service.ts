import { Injectable } from '@nestjs/common';
import { AttendanceStatus } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getAdminDashboard(schoolId: string) {
    const [students, teachers, sections, announcements, absences, classes, activeTerms, departments, semesters, marks, recentAnnouncements] =
      await this.prisma.$transaction([
      this.prisma.student.count({ where: { schoolId } }),
      this.prisma.teacher.count({ where: { schoolId } }),
      this.prisma.section.count({ where: { schoolId } }),
      this.prisma.announcement.count({ where: { schoolId } }),
      this.prisma.attendance.count({
        where: {
          student: { schoolId },
          status: AttendanceStatus.ABSENT,
        },
      }),
      this.prisma.academicClass.count({ where: { schoolId } }),
      this.prisma.academicTerm.count({ where: { schoolId, isActive: true } }),
      this.prisma.department.count({ where: { schoolId } }),
      this.prisma.semester.count({ where: { schoolId, status: 'ACTIVE' } }),
      this.prisma.mark.findMany({
        where: {
          student: { schoolId },
        },
        include: {
          assessment: true,
        },
      }),
      this.prisma.announcement.findMany({
        where: { schoolId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const studentAttendanceRows = await this.prisma.attendance.groupBy({
      by: ['studentId', 'status'],
      where: {
        student: { schoolId },
      },
      _count: {
        _all: true,
      },
    });

    const attendanceByStudent = new Map<string, { total: number; attended: number }>();
    for (const row of studentAttendanceRows) {
      const current = attendanceByStudent.get(row.studentId) ?? { total: 0, attended: 0 };
      current.total += row._count._all;
      if (row.status !== AttendanceStatus.ABSENT) {
        current.attended += row._count._all;
      }
      attendanceByStudent.set(row.studentId, current);
    }

    const lowAttendanceCount = Array.from(attendanceByStudent.values()).filter(({ total, attended }) => {
      if (!total) {
        return false;
      }

      return (attended / total) * 100 < 75;
    }).length;

    const marksByStudent = new Map<string, { obtained: number; max: number }>();
    for (const mark of marks) {
      const current = marksByStudent.get(mark.studentId) ?? { obtained: 0, max: 0 };
      current.obtained += Number(mark.marksObtained);
      current.max += Number(mark.assessment.maxMarks);
      marksByStudent.set(mark.studentId, current);
    }

    const lowPerformanceCount = Array.from(marksByStudent.values()).filter(({ obtained, max }) => {
      if (!max) {
        return false;
      }

      return (obtained / max) * 100 < 60;
    }).length;

    return {
      metrics: {
        students,
        teachers,
        sections,
        classes,
        activeTerms,
        departments,
        activeSemesters: semesters,
        announcements,
        absences,
        lowAttendanceCount,
        lowPerformanceCount,
      },
      recentAnnouncements,
    };
  }

  async getTeacherDashboard(teacherId: string) {
    const assignments = await this.prisma.teacherSubjectAssignment.findMany({
      where: { teacherId },
      include: {
        academicClass: true,
        section: true,
        subject: true,
      },
      orderBy: [{ section: { name: 'asc' } }],
    });

    const [recentSessions, recentAnnouncements] = await this.prisma.$transaction([
      this.prisma.attendanceSession.findMany({
        where: { teacherId },
        include: {
          section: true,
          subject: true,
        },
        orderBy: { date: 'desc' },
        take: 5,
      }),
      this.prisma.announcement.findMany({
        where: { teacherId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      assignments,
      stats: {
        classesHandled: assignments.length,
      },
      recentSessions,
      recentAnnouncements,
    };
  }

  async getStudentDashboard(studentId: string) {
    const student = await this.prisma.student.findUniqueOrThrow({
      where: { id: studentId },
      include: {
        section: {
          include: {
            academicClass: true,
            department: true,
            semester: true,
          },
        },
        department: true,
        marks: {
          include: {
            assessment: {
              include: {
                subject: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        attendance: {
          include: {
            attendanceSession: {
              include: {
                subject: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    return {
      student: {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        rollNumber: student.rollNumber,
        usn: student.usn,
        departmentName: student.department?.name ?? student.section.department?.name ?? null,
        currentSemester: student.currentSemester ?? student.section.semesterNumber ?? student.section.semester?.number ?? null,
        className: student.section.academicClass.name,
        sectionName: student.section.name,
      },
      recentMarks: student.marks.map((mark) => ({
        id: mark.id,
        title: mark.assessment.title,
        subject: mark.assessment.subject.name,
        marksObtained: mark.marksObtained,
        maxMarks: mark.assessment.maxMarks,
        grade: mark.grade,
      })),
      recentAttendance: student.attendance.map((record) => ({
        id: record.id,
        status: record.status,
        subject: record.attendanceSession.subject.name,
        date: record.attendanceSession.date,
      })),
    };
  }
}
