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
exports.TeachersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const argon2 = __importStar(require("argon2"));
const prisma_service_1 = require("../../config/prisma.service");
let TeachersService = class TeachersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    normalizeOptional(value) {
        const normalized = value?.trim();
        return normalized ? normalized : undefined;
    }
    getAssignments(teacherId) {
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
    list(schoolId, query) {
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
    async create(schoolId, payload) {
        const user = await this.prisma.user.create({
            data: {
                email: payload.email.trim().toLowerCase(),
                phone: this.normalizeOptional(payload.mobileNumber),
                passwordHash: await argon2.hash(payload.password),
                role: client_1.UserRole.TEACHER,
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
    async update(schoolId, teacherId, payload) {
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
            throw new common_1.NotFoundException('Teacher not found');
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
    async remove(schoolId, teacherId) {
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
            throw new common_1.NotFoundException('Teacher not found');
        }
        await this.prisma.user.delete({
            where: { id: teacher.userId },
        });
        return { message: 'Teacher deleted successfully' };
    }
};
exports.TeachersService = TeachersService;
exports.TeachersService = TeachersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeachersService);
