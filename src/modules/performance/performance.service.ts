import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { CreateStudentRemarkDto } from './dto/create-student-remark.dto';
import { UpsertMarksDto } from './dto/upsert-marks.dto';
import { PerformanceQueryDto } from './dto/performance-query.dto';

function toNumber(value: Prisma.Decimal | number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  return Number(value);
}

@Injectable()
export class PerformanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getTeacherOverview(teacherId: string) {
    const assignments = await this.prisma.teacherSubjectAssignment.findMany({
      where: { teacherId },
      include: {
        academicClass: true,
        section: {
          include: {
            students: {
              select: { id: true },
            },
          },
        },
        subject: true,
      },
      orderBy: [{ academicClass: { gradeLevel: 'asc' } }, { section: { name: 'asc' } }],
    });

    const subjectIds = assignments.map((assignment) => assignment.subjectId);

    const assessments = await this.prisma.assessment.findMany({
      where: {
        subjectId: {
          in: subjectIds.length ? subjectIds : ['__none__'],
        },
      },
      include: {
        subject: true,
        term: true,
        marks: true,
      },
      orderBy: [{ scheduledFor: 'desc' }, { createdAt: 'desc' }],
      take: 10,
    });

    return {
      stats: {
        assignments: assignments.length,
        studentsCovered: assignments.reduce((sum, assignment) => sum + assignment.section.students.length, 0),
        assessments: assessments.length,
        completedAssessments: assessments.filter((assessment) => assessment.marks.length > 0).length,
      },
      assignments: assignments.map((assignment) => ({
        id: assignment.id,
        sectionId: assignment.sectionId,
        subjectId: assignment.subjectId,
        className: assignment.academicClass.name,
        sectionName: assignment.section.name,
        subjectName: assignment.subject.name,
        rosterSize: assignment.section.students.length,
        isClassLead: assignment.isClassLead,
      })),
      recentAssessments: assessments.map((assessment) => ({
        id: assessment.id,
        title: assessment.title,
        type: assessment.type,
        subjectName: assessment.subject.name,
        termName: assessment.term.name,
        maxMarks: toNumber(assessment.maxMarks),
        weightage: toNumber(assessment.weightage),
        scheduledFor: assessment.scheduledFor,
        submissions: assessment.marks.length,
      })),
    };
  }

  async listTeacherAssessments(teacherId: string, query: PerformanceQueryDto) {
    const assignment = await this.ensureTeacherAssignment(teacherId, query.sectionId, query.subjectId);
    const resolvedTermId = query.termId ?? (query.sectionId ? await this.resolveActiveTermId(query.sectionId) : undefined);

    const assessments = await this.prisma.assessment.findMany({
      where: {
        subjectId: query.subjectId,
        termId: resolvedTermId,
        subjectOfferingId: assignment.subjectOfferingId ?? undefined,
      },
      include: {
        subject: true,
        term: true,
        component: true,
        marks: {
          include: {
            student: true,
          },
          orderBy: { student: { rollNumber: 'asc' } },
        },
      },
      orderBy: [{ scheduledFor: 'desc' }, { createdAt: 'desc' }],
    });

    return assessments.map((assessment) => ({
      id: assessment.id,
      title: assessment.title,
      type: assessment.type,
      subjectName: assessment.subject.name,
      termName: assessment.term.name,
      maxMarks: toNumber(assessment.maxMarks),
      weightage: toNumber(assessment.weightage),
      scheduledFor: assessment.scheduledFor,
      componentName: assessment.component?.name ?? null,
      marks: assessment.marks.map((mark) => ({
        id: mark.id,
        studentId: mark.studentId,
        studentName: `${mark.student.firstName} ${mark.student.lastName}`,
        rollNumber: mark.student.rollNumber,
        marksObtained: toNumber(mark.marksObtained),
        grade: mark.grade,
        remark: mark.remark,
      })),
    }));
  }

  async createAssessment(teacherId: string, payload: CreateAssessmentDto) {
    const assignment = await this.ensureTeacherAssignment(teacherId, payload.sectionId, payload.subjectId);
    const resolvedTermId = payload.termId ?? (await this.resolveActiveTermId(payload.sectionId));

    if (!resolvedTermId) {
      throw new NotFoundException('No active academic term available for this section');
    }

    return this.prisma.assessment.create({
      data: {
        subjectId: payload.subjectId,
        termId: resolvedTermId,
        subjectOfferingId: assignment.subjectOfferingId ?? undefined,
        title: payload.title,
        type: payload.type,
        maxMarks: payload.maxMarks,
        weightage: payload.weightage,
        scheduledFor: payload.scheduledFor ? new Date(payload.scheduledFor) : undefined,
      },
    });
  }

  async upsertMarks(teacherId: string, payload: UpsertMarksDto) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: payload.assessmentId },
      include: {
        subjectOffering: {
          select: {
            id: true,
            sectionId: true,
          },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    const assignment = await this.ensureTeacherAssignment(
      teacherId,
      assessment.subjectOffering?.sectionId ?? undefined,
      assessment.subjectId,
    );

    if (assessment.subjectOfferingId && assignment.subjectOfferingId && assessment.subjectOfferingId !== assignment.subjectOfferingId) {
      throw new ForbiddenException('You are not assigned to this assessment offering');
    }

    for (const record of payload.records) {
      if (record.marksObtained > Number(assessment.maxMarks)) {
        throw new BadRequestException(`Marks cannot exceed ${Number(assessment.maxMarks)} for this assessment`);
      }
    }

    await this.prisma.$transaction(
      payload.records.map((record) =>
        this.prisma.mark.upsert({
          where: {
            assessmentId_studentId: {
              assessmentId: payload.assessmentId,
              studentId: record.studentId,
            },
          },
          update: {
            marksObtained: record.marksObtained,
            grade: record.grade,
            remark: record.remark,
          },
          create: {
            assessmentId: payload.assessmentId,
            studentId: record.studentId,
            marksObtained: record.marksObtained,
            grade: record.grade,
            remark: record.remark,
          },
        }),
      ),
    );

    await this.recalculateFinalInternalMarks(payload.assessmentId);

    return this.prisma.mark.findMany({
      where: { assessmentId: payload.assessmentId },
      include: {
        student: true,
      },
      orderBy: { student: { rollNumber: 'asc' } },
    });
  }

  async getStudentSummary(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        section: {
          include: {
            academicClass: true,
            department: true,
            semester: true,
            timetableEntries: {
              include: {
                subject: true,
                teacher: true,
              },
              orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
            },
          },
        },
        department: true,
        marks: {
          include: {
            assessment: {
              include: {
                subject: true,
                term: true,
                component: true,
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
        finalInternalMarks: {
          include: {
            subjectOffering: {
              include: {
                subject: true,
                semester: true,
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
        semesterExamResults: {
          include: {
            semester: true,
            subject: true,
          },
          orderBy: { updatedAt: 'desc' },
        },
        remarks: {
          include: {
            teacher: true,
            term: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 6,
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const subjects = new Map<
      string,
      { subjectName: string; subjectId: string; totalObtained: number; totalMax: number; assessments: number }
    >();

    for (const mark of student.marks) {
      const current = subjects.get(mark.assessment.subjectId) ?? {
        subjectName: mark.assessment.subject.name,
        subjectId: mark.assessment.subjectId,
        totalObtained: 0,
        totalMax: 0,
        assessments: 0,
      };

      current.totalObtained += Number(mark.marksObtained);
      current.totalMax += Number(mark.assessment.maxMarks);
      current.assessments += 1;
      subjects.set(mark.assessment.subjectId, current);
    }

    const totalObtained = student.marks.reduce((sum, mark) => sum + Number(mark.marksObtained), 0);
    const totalMax = student.marks.reduce((sum, mark) => sum + Number(mark.assessment.maxMarks), 0);

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
      summary: {
        totalAssessments: student.marks.length,
        totalObtained,
        totalMax,
        overallPercentage: totalMax ? Number(((totalObtained / totalMax) * 100).toFixed(1)) : 0,
      },
      subjectBreakdown: Array.from(subjects.values()).map((subject) => ({
        ...subject,
        percentage: subject.totalMax ? Number(((subject.totalObtained / subject.totalMax) * 100).toFixed(1)) : 0,
      })),
      recentMarks: student.marks.slice(0, 12).map((mark) => ({
        id: mark.id,
        title: mark.assessment.title,
        type: mark.assessment.type,
        componentName: mark.assessment.component?.name ?? null,
        subjectName: mark.assessment.subject.name,
        termName: mark.assessment.term.name,
        marksObtained: Number(mark.marksObtained),
        maxMarks: Number(mark.assessment.maxMarks),
        grade: mark.grade,
        remark: mark.remark,
        updatedAt: mark.updatedAt,
      })),
      remarks: student.remarks.map((remark) => ({
        id: remark.id,
        teacherName: `${remark.teacher.firstName} ${remark.teacher.lastName}`,
        termName: remark.term?.name ?? null,
        content: remark.content,
        createdAt: remark.createdAt,
      })),
      finalInternalMarks: student.finalInternalMarks.map((item) => ({
        id: item.id,
        subjectName: item.subjectOffering.subject.name,
        semesterLabel: item.subjectOffering.semester.label,
        totalMarks: Number(item.totalMarks),
        outOfMarks: Number(item.outOfMarks),
        remark: item.remark,
      })),
      semesterResults: student.semesterExamResults.map((result) => ({
        id: result.id,
        subjectName: result.subject.name,
        semesterLabel: result.semester.label,
        marksObtained: Number(result.marksObtained),
        maxMarks: Number(result.maxMarks),
        grade: result.grade,
        resultStatus: result.resultStatus,
      })),
      timetable: student.section.timetableEntries.map((entry) => ({
        id: entry.id,
        dayOfWeek: entry.dayOfWeek,
        periodLabel: entry.periodLabel,
        startTime: entry.startTime,
        endTime: entry.endTime,
        roomLabel: entry.roomLabel,
        teacherName: entry.teacherName ?? (entry.teacher ? `${entry.teacher.firstName} ${entry.teacher.lastName}` : null),
        subjectName: entry.subject.name,
      })),
    };
  }

  async createStudentRemark(teacherId: string, payload: CreateStudentRemarkDto) {
    const student = await this.prisma.student.findUnique({
      where: { id: payload.studentId },
      select: {
        id: true,
        schoolId: true,
        sectionId: true,
        section: {
          select: {
            classId: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const assignment = await this.prisma.teacherSubjectAssignment.findFirst({
      where: {
        teacherId,
        sectionId: student.sectionId,
      },
      select: { id: true },
    });

    if (!assignment) {
      throw new ForbiddenException('You are not assigned to this student section');
    }

    const resolvedTermId =
      payload.termId ??
      (
        await this.prisma.academicTerm.findFirst({
          where: {
            schoolId: student.schoolId,
            classId: student.section.classId,
            isActive: true,
          },
          orderBy: { startDate: 'desc' },
        })
      )?.id;

    return this.prisma.studentRemark.create({
      data: {
        studentId: payload.studentId,
        teacherId,
        termId: resolvedTermId,
        content: payload.content.trim(),
      },
    });
  }

  async getAdminOverview(schoolId: string) {
    const [assessmentCount, markCount, topStudents] = await this.prisma.$transaction([
      this.prisma.assessment.count({
        where: {
          term: { schoolId },
        },
      }),
      this.prisma.mark.count({
        where: {
          student: { schoolId },
        },
      }),
      this.prisma.student.findMany({
        where: { schoolId },
        include: {
          section: {
            include: {
              academicClass: true,
            },
          },
          marks: {
            include: {
              assessment: true,
            },
          },
        },
      }),
    ]);

    return {
      stats: {
        assessmentCount,
        markCount,
      },
      topStudents: topStudents
        .map((student) => {
          const totalObtained = student.marks.reduce((sum, mark) => sum + Number(mark.marksObtained), 0);
          const totalMax = student.marks.reduce((sum, mark) => sum + Number(mark.assessment.maxMarks), 0);

          return {
            id: student.id,
            name: `${student.firstName} ${student.lastName}`,
            rollNumber: student.rollNumber,
            className: student.section.academicClass.name,
            sectionName: student.section.name,
            percentage: totalMax ? Number(((totalObtained / totalMax) * 100).toFixed(1)) : 0,
          };
        })
        .sort((left, right) => right.percentage - left.percentage)
        .slice(0, 5),
    };
  }

  private async resolveActiveTermId(sectionId: string) {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      select: {
        classId: true,
        schoolId: true,
      },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    return (
      await this.prisma.academicTerm.findFirst({
        where: {
          schoolId: section.schoolId,
          classId: section.classId,
          isActive: true,
        },
        orderBy: { startDate: 'desc' },
      })
    )?.id;
  }

  private async ensureTeacherAssignment(teacherId: string, sectionId?: string, subjectId?: string) {
    const where: Prisma.TeacherSubjectAssignmentWhereInput = {
      teacherId,
      subjectId,
      sectionId,
    };

    const assignment = await this.prisma.teacherSubjectAssignment.findFirst({ where });

    if (!assignment) {
      throw new ForbiddenException('You are not assigned to this class and subject');
    }

    return assignment;
  }

  private async recalculateFinalInternalMarks(assessmentId: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        subjectOffering: {
          include: {
            internalMarksPolicy: {
              include: {
                components: true,
              },
            },
          },
        },
      },
    });

    if (!assessment?.subjectOfferingId || !assessment.subjectOffering) {
      return;
    }

    const marks = await this.prisma.mark.findMany({
      where: {
        assessment: {
          subjectOfferingId: assessment.subjectOfferingId,
        },
      },
      include: {
        assessment: true,
      },
    });

    const totals = new Map<string, number>();
    const maxTotal = marks.reduce((sum, mark) => sum + Number(mark.assessment.maxMarks), 0);
    for (const mark of marks) {
      totals.set(mark.studentId, (totals.get(mark.studentId) ?? 0) + Number(mark.marksObtained));
    }

    const policyTotal = Number(
      assessment.subjectOffering.internalMarksPolicy?.totalMarks ?? assessment.subjectOffering.totalInternalMarks,
    );
    for (const [studentId, totalMarks] of totals.entries()) {
      const normalizedTotal = maxTotal > 0 ? Number(((totalMarks / maxTotal) * policyTotal).toFixed(2)) : 0;
      await this.prisma.finalInternalMark.upsert({
        where: {
          studentId_subjectOfferingId: {
            studentId,
            subjectOfferingId: assessment.subjectOfferingId,
          },
        },
        update: {
          totalMarks: normalizedTotal,
          outOfMarks: policyTotal,
        },
        create: {
          studentId,
          subjectOfferingId: assessment.subjectOfferingId,
          totalMarks: normalizedTotal,
          outOfMarks: policyTotal,
        },
      });
    }
  }
}
