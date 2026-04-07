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
exports.StudentsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const argon2 = __importStar(require("argon2"));
const prisma_service_1 = require("../../config/prisma.service");
let StudentsService = class StudentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    normalizeOptional(value) {
        const normalized = value?.trim();
        return normalized ? normalized : undefined;
    }
    async list(schoolId, query) {
        const where = {
            schoolId,
            OR: query.search
                ? [
                    { firstName: { contains: query.search, mode: 'insensitive' } },
                    { lastName: { contains: query.search, mode: 'insensitive' } },
                    { rollNumber: { contains: query.search, mode: 'insensitive' } },
                    { admissionNo: { contains: query.search, mode: 'insensitive' } },
                    { usn: { contains: query.search, mode: 'insensitive' } },
                    { aadhaarNumber: { contains: query.search, mode: 'insensitive' } },
                    { parentPhone: { contains: query.search, mode: 'insensitive' } },
                    { course: { contains: query.search, mode: 'insensitive' } },
                    { user: { email: { contains: query.search, mode: 'insensitive' } } },
                    { user: { phone: { contains: query.search, mode: 'insensitive' } } },
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
    getStudentProfile(studentId) {
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
    async create(schoolId, payload) {
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
            throw new common_1.NotFoundException('Section not found');
        }
        const user = await this.prisma.user.create({
            data: {
                email: payload.email.trim().toLowerCase(),
                phone: this.normalizeOptional(payload.mobileNumber),
                passwordHash: await argon2.hash(payload.password),
                role: client_1.UserRole.STUDENT,
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
    async update(schoolId, studentId, payload) {
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
            throw new common_1.NotFoundException('Student not found');
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
                throw new common_1.NotFoundException('Section not found');
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
    async remove(schoolId, studentId) {
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
            throw new common_1.NotFoundException('Student not found');
        }
        await this.prisma.user.delete({
            where: { id: student.userId },
        });
        return { message: 'Student deleted successfully' };
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StudentsService);
