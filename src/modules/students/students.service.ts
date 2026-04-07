import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../../config/prisma.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeOptional(value?: string) {
    const normalized = value?.trim();
    return normalized ? normalized : undefined;
  }

  async list(schoolId: string, query: PaginationQueryDto) {
    const where = {
      schoolId,
      OR: query.search
        ? [
            { firstName: { contains: query.search, mode: 'insensitive' as const } },
            { lastName: { contains: query.search, mode: 'insensitive' as const } },
            { rollNumber: { contains: query.search, mode: 'insensitive' as const } },
            { admissionNo: { contains: query.search, mode: 'insensitive' as const } },
            { usn: { contains: query.search, mode: 'insensitive' as const } },
            { aadhaarNumber: { contains: query.search, mode: 'insensitive' as const } },
            { parentPhone: { contains: query.search, mode: 'insensitive' as const } },
            { course: { contains: query.search, mode: 'insensitive' as const } },
            { user: { email: { contains: query.search, mode: 'insensitive' as const } } },
            { user: { phone: { contains: query.search, mode: 'insensitive' as const } } },
          ]
        : undefined,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.student.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
        include: {
          department: true,
          profile: true,
          section: {
            include: {
              department: true,
              semester: true,
              academicClass: true,
            },
          },
          user: {
            select: {
              email: true,
              phone: true,
            },
          },
        },
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
      },
    };
  }

  getStudentProfile(studentId: string) {
    return this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        department: true,
        profile: true,
        section: {
          include: {
            department: true,
            semester: true,
            academicClass: true,
          },
        },
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async create(schoolId: string, payload: CreateStudentDto) {
    const section = await this.prisma.section.findFirst({
      where: {
        id: payload.sectionId,
        schoolId,
      },
      include: {
        semester: true,
      },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    const user = await this.prisma.user.create({
      data: {
        email: payload.email.trim().toLowerCase(),
        phone: this.normalizeOptional(payload.mobileNumber),
        passwordHash: await argon2.hash(payload.password),
        role: UserRole.STUDENT,
        studentProfile: {
          create: {
            schoolId,
            sectionId: payload.sectionId,
            departmentId: payload.departmentId ?? section.departmentId,
            admissionNo: payload.admissionNo.trim(),
            rollNumber: payload.rollNumber.trim(),
            usn: payload.usn.trim().toUpperCase(),
            aadhaarNumber: this.normalizeOptional(payload.aadhaarNumber),
            course: this.normalizeOptional(payload.course),
            currentYear: payload.currentYear ? Number(payload.currentYear) : undefined,
            currentSemester: payload.currentSemester ? Number(payload.currentSemester) : section.semesterNumber ?? section.semester?.number,
            batchStartYear: payload.batchStartYear ? Number(payload.batchStartYear) : undefined,
            firstName: payload.firstName.trim(),
            lastName: payload.lastName.trim(),
            dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : undefined,
            gender: this.normalizeOptional(payload.gender),
            fatherName: this.normalizeOptional(payload.fatherName),
            motherName: this.normalizeOptional(payload.motherName),
            parentPhone: this.normalizeOptional(payload.parentPhone),
            guardianName: this.normalizeOptional(payload.guardianName),
            guardianPhone: this.normalizeOptional(payload.guardianPhone),
            address: this.normalizeOptional(payload.address),
          },
        },
      },
      include: {
        studentProfile: true,
      },
    });

    const createdStudent = await this.prisma.student.findUniqueOrThrow({
      where: { userId: user.id },
      select: { id: true },
    });

    const activeTerm = await this.prisma.academicTerm.findFirst({
      where: {
        schoolId,
        classId: section.classId,
        isActive: true,
      },
      orderBy: { startDate: 'desc' },
    });

    if (activeTerm) {
      await this.prisma.enrollment.upsert({
        where: {
          studentId_termId: {
            studentId: createdStudent.id,
            termId: activeTerm.id,
          },
        },
        update: {
          sectionId: section.id,
        },
        create: {
          studentId: createdStudent.id,
          sectionId: section.id,
          termId: activeTerm.id,
        },
      });
    }

    return this.getStudentProfile(createdStudent.id);
  }

  async update(schoolId: string, studentId: string, payload: UpdateStudentDto) {
    const existingStudent = await this.prisma.student.findFirst({
      where: {
        id: studentId,
        schoolId,
      },
      include: {
        user: true,
      },
    });

    if (!existingStudent) {
      throw new NotFoundException('Student not found');
    }

    if (payload.sectionId) {
      const section = await this.prisma.section.findFirst({
        where: {
          id: payload.sectionId,
          schoolId,
        },
        include: {
          semester: true,
        },
      });

      if (!section) {
        throw new NotFoundException('Section not found');
      }
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: existingStudent.userId },
        data: {
          email: payload.email?.trim().toLowerCase(),
          phone: this.normalizeOptional(payload.mobileNumber),
          passwordHash: payload.password ? await argon2.hash(payload.password) : undefined,
        },
      }),
      this.prisma.student.update({
        where: { id: studentId },
        data: {
          sectionId: payload.sectionId,
          departmentId: payload.departmentId,
          admissionNo: this.normalizeOptional(payload.admissionNo),
          rollNumber: this.normalizeOptional(payload.rollNumber),
          usn: this.normalizeOptional(payload.usn)?.toUpperCase(),
          aadhaarNumber: this.normalizeOptional(payload.aadhaarNumber),
          course: this.normalizeOptional(payload.course),
          currentYear: payload.currentYear ? Number(payload.currentYear) : undefined,
          currentSemester: payload.currentSemester ? Number(payload.currentSemester) : undefined,
          batchStartYear: payload.batchStartYear ? Number(payload.batchStartYear) : undefined,
          firstName: this.normalizeOptional(payload.firstName),
          lastName: this.normalizeOptional(payload.lastName),
          dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : undefined,
          gender: this.normalizeOptional(payload.gender),
          fatherName: this.normalizeOptional(payload.fatherName),
          motherName: this.normalizeOptional(payload.motherName),
          parentPhone: this.normalizeOptional(payload.parentPhone),
          guardianName: this.normalizeOptional(payload.guardianName),
          guardianPhone: this.normalizeOptional(payload.guardianPhone),
          address: this.normalizeOptional(payload.address),
        },
      }),
    ]);

    return this.getStudentProfile(studentId);
  }

  async remove(schoolId: string, studentId: string) {
    const student = await this.prisma.student.findFirst({
      where: {
        id: studentId,
        schoolId,
      },
      select: {
        userId: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    await this.prisma.user.delete({
      where: { id: student.userId },
    });

    return { message: 'Student deleted successfully' };
  }
}
