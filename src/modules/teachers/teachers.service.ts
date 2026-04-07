import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../../config/prisma.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeachersService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeOptional(value?: string) {
    const normalized = value?.trim();
    return normalized ? normalized : undefined;
  }

  getAssignments(teacherId: string) {
    return this.prisma.teacherSubjectAssignment.findMany({
      where: { teacherId },
      include: {
        academicClass: true,
        section: true,
        subject: true,
      },
      orderBy: [{ academicClass: { gradeLevel: 'asc' } }, { section: { name: 'asc' } }],
    });
  }

  list(schoolId: string, query: PaginationQueryDto) {
    return this.prisma.teacher.findMany({
      where: {
        schoolId,
        OR: query.search
          ? [
              { firstName: { contains: query.search, mode: 'insensitive' } },
              { lastName: { contains: query.search, mode: 'insensitive' } },
              { employeeId: { contains: query.search, mode: 'insensitive' } },
              { aadhaarNumber: { contains: query.search, mode: 'insensitive' } },
              { user: { email: { contains: query.search, mode: 'insensitive' } } },
              { user: { phone: { contains: query.search, mode: 'insensitive' } } },
            ]
          : undefined,
      },
      include: {
        department: true,
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
        assignments: {
          include: {
            academicClass: true,
            section: true,
            subject: true,
          },
        },
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
  }

  async create(schoolId: string, payload: CreateTeacherDto) {
    const user = await this.prisma.user.create({
      data: {
        email: payload.email.trim().toLowerCase(),
        phone: this.normalizeOptional(payload.mobileNumber),
        passwordHash: await argon2.hash(payload.password),
        role: UserRole.TEACHER,
        teacherProfile: {
          create: {
            schoolId,
            departmentId: payload.departmentId,
            firstName: payload.firstName.trim(),
            lastName: payload.lastName.trim(),
            employeeId: payload.employeeId.trim(),
            aadhaarNumber: this.normalizeOptional(payload.aadhaarNumber),
            designation: this.normalizeOptional(payload.designation),
            qualification: this.normalizeOptional(payload.qualification),
            specialization: this.normalizeOptional(payload.specialization),
            address: this.normalizeOptional(payload.address),
          },
        },
      },
      include: {
        teacherProfile: true,
      },
    });

    const createdTeacher = await this.prisma.teacher.findUniqueOrThrow({
      where: { userId: user.id },
      select: { id: true },
    });

    return this.prisma.teacher.findUniqueOrThrow({
      where: { id: createdTeacher.id },
      include: {
        department: true,
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
        assignments: {
          include: {
            academicClass: true,
            section: true,
            subject: true,
          },
        },
      },
    });
  }

  async update(schoolId: string, teacherId: string, payload: UpdateTeacherDto) {
    const teacher = await this.prisma.teacher.findFirst({
      where: {
        id: teacherId,
        schoolId,
      },
      select: {
        userId: true,
      },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: teacher.userId },
        data: {
          email: payload.email?.trim().toLowerCase(),
          phone: this.normalizeOptional(payload.mobileNumber),
          passwordHash: payload.password ? await argon2.hash(payload.password) : undefined,
        },
      }),
      this.prisma.teacher.update({
        where: { id: teacherId },
        data: {
          firstName: this.normalizeOptional(payload.firstName),
          lastName: this.normalizeOptional(payload.lastName),
          employeeId: this.normalizeOptional(payload.employeeId),
          aadhaarNumber: this.normalizeOptional(payload.aadhaarNumber),
          departmentId: payload.departmentId,
          designation: this.normalizeOptional(payload.designation),
          qualification: this.normalizeOptional(payload.qualification),
          specialization: this.normalizeOptional(payload.specialization),
          address: this.normalizeOptional(payload.address),
        },
      }),
    ]);

    return this.prisma.teacher.findUniqueOrThrow({
      where: { id: teacherId },
      include: {
        department: true,
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
        assignments: {
          include: {
            academicClass: true,
            section: true,
            subject: true,
          },
        },
      },
    });
  }

  async remove(schoolId: string, teacherId: string) {
    const teacher = await this.prisma.teacher.findFirst({
      where: {
        id: teacherId,
        schoolId,
      },
      select: {
        userId: true,
      },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    await this.prisma.user.delete({
      where: { id: teacher.userId },
    });

    return { message: 'Teacher deleted successfully' };
  }
}
