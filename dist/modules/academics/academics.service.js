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
exports.AcademicsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
let AcademicsService = class AcademicsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAdminOverview(schoolId) {
        const school = await this.prisma.school.findUnique({
            where: { id: schoolId },
            select: {
                id: true,
                name: true,
                code: true,
                city: true,
                timezone: true,
            },
        });
        if (!school) {
            throw new common_1.NotFoundException('School not found');
        }
        const [classes, subjects, terms, departments, teachers, academicYears, semesters, subjectOfferings, internalMarksPolicies] = await this.prisma.$transaction([
            this.prisma.academicClass.findMany({
                where: { schoolId },
                include: {
                    sections: {
                        include: {
                            students: {
                                select: { id: true },
                            },
                            assignments: {
                                include: {
                                    teacher: true,
                                    subject: true,
                                },
                            },
                        },
                        orderBy: [{ semesterNumber: 'asc' }, { name: 'asc' }],
                    },
                },
                orderBy: { gradeLevel: 'asc' },
            }),
            this.prisma.subject.findMany({
                where: { schoolId },
                orderBy: [{ code: 'asc' }, { name: 'asc' }],
            }),
            this.prisma.academicTerm.findMany({
                where: { schoolId },
                orderBy: [{ isActive: 'desc' }, { startDate: 'desc' }],
            }),
            this.prisma.department.findMany({
                where: { schoolId },
                orderBy: { name: 'asc' },
            }),
            this.prisma.teacher.findMany({
                where: { schoolId },
                include: {
                    department: true,
                },
                orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
            }),
            this.prisma.academicYear.findMany({
                where: { schoolId },
                orderBy: [{ isActive: 'desc' }, { startYear: 'desc' }],
            }),
            this.prisma.semester.findMany({
                where: { schoolId },
                include: {
                    department: true,
                    academicYear: true,
                },
                orderBy: [{ number: 'asc' }, { department: { code: 'asc' } }],
            }),
            this.prisma.subjectOffering.findMany({
                where: { schoolId },
                include: {
                    department: true,
                    semester: true,
                    section: true,
                    subject: true,
                    internalMarksPolicy: true,
                },
                orderBy: [{ semester: { number: 'asc' } }, { subject: { code: 'asc' } }],
            }),
            this.prisma.internalMarksPolicy.findMany({
                where: { schoolId },
                include: {
                    department: true,
                    academicYear: true,
                    semester: true,
                    components: {
                        orderBy: { displayOrder: 'asc' },
                    },
                },
                orderBy: [{ createdAt: 'desc' }],
            }),
        ]);
        return {
            school: {
                id: school.id,
                name: school.name,
                code: school.code,
                city: school.city,
                timezone: school.timezone,
            },
            classes: classes.map((academicClass) => ({
                id: academicClass.id,
                name: academicClass.name,
                gradeLevel: academicClass.gradeLevel,
                sections: academicClass.sections.map((section) => ({
                    id: section.id,
                    name: section.name,
                    roomLabel: section.roomLabel,
                    departmentId: section.departmentId,
                    semesterNumber: section.semesterNumber,
                    studentCount: section.students.length,
                    assignments: section.assignments.map((assignment) => ({
                        id: assignment.id,
                        subjectName: assignment.subject.name,
                        teacherName: `${assignment.teacher.firstName} ${assignment.teacher.lastName}`,
                    })),
                })),
            })),
            departments,
            subjects,
            terms,
            teachers: teachers.map((teacher) => ({
                id: teacher.id,
                name: `${teacher.firstName} ${teacher.lastName}`,
                employeeId: teacher.employeeId,
                departmentName: teacher.department?.name ?? null,
            })),
            academicYears,
            semesters: semesters.map((semester) => ({
                id: semester.id,
                departmentId: semester.departmentId,
                academicYearId: semester.academicYearId,
                number: semester.number,
                label: semester.label,
                status: semester.status,
                departmentName: semester.department.name,
                academicYearName: semester.academicYear?.name ?? null,
            })),
            subjectOfferings: subjectOfferings.map((offering) => ({
                id: offering.id,
                departmentId: offering.departmentId,
                academicYearId: offering.academicYearId,
                semesterId: offering.semesterId,
                sectionId: offering.sectionId,
                subjectId: offering.subjectId,
                internalMarksPolicyId: offering.internalMarksPolicyId,
                totalInternalMarks: Number(offering.totalInternalMarks),
                departmentName: offering.department.name,
                semesterLabel: offering.semester.label,
                sectionName: offering.section?.name ?? null,
                subjectCode: offering.subject.code,
                subjectName: offering.subject.name,
                subjectType: offering.subject.subjectType,
                policyName: offering.internalMarksPolicy?.name ?? null,
            })),
            internalMarksPolicies: internalMarksPolicies.map((policy) => ({
                id: policy.id,
                name: policy.name,
                totalMarks: Number(policy.totalMarks),
                attendanceThreshold: policy.attendanceThreshold,
                attendanceBonusMarks: policy.attendanceBonusMarks ? Number(policy.attendanceBonusMarks) : null,
                departmentName: policy.department?.name ?? null,
                academicYearName: policy.academicYear?.name ?? null,
                semesterLabel: policy.semester?.label ?? null,
                components: policy.components.map((component) => ({
                    id: component.id,
                    code: component.code,
                    name: component.name,
                    maxMarks: Number(component.maxMarks),
                    weightage: component.weightage ? Number(component.weightage) : null,
                    displayOrder: component.displayOrder,
                })),
            })),
        };
    }
    async getStudentTimetable(studentId) {
        const student = await this.prisma.student.findUnique({
            where: { id: studentId },
            include: {
                section: {
                    include: {
                        academicClass: true,
                        timetableEntries: {
                            include: {
                                subject: true,
                            },
                            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
                        },
                    },
                },
            },
        });
        if (!student) {
            throw new common_1.NotFoundException('Student not found');
        }
        return {
            student: {
                id: student.id,
                name: `${student.firstName} ${student.lastName}`,
                className: student.section.academicClass.name,
                sectionName: student.section.name,
            },
            timetable: student.section.timetableEntries.map((entry) => ({
                id: entry.id,
                dayOfWeek: entry.dayOfWeek,
                startTime: entry.startTime,
                endTime: entry.endTime,
                roomLabel: entry.roomLabel,
                teacherName: entry.teacherName,
                subjectName: entry.subject.name,
            })),
        };
    }
    createClass(schoolId, payload) {
        return this.prisma.academicClass.create({
            data: {
                schoolId,
                name: payload.name.trim(),
                gradeLevel: payload.gradeLevel,
            },
        });
    }
    async updateClass(schoolId, classId, payload) {
        await this.ensureClassBelongsToSchool(schoolId, classId);
        return this.prisma.academicClass.update({
            where: { id: classId },
            data: {
                name: payload.name?.trim(),
                gradeLevel: payload.gradeLevel,
            },
        });
    }
    async removeClass(schoolId, classId) {
        await this.ensureClassBelongsToSchool(schoolId, classId);
        await this.prisma.academicClass.delete({ where: { id: classId } });
        return { message: 'Class deleted successfully' };
    }
    async createSection(schoolId, payload) {
        await this.ensureClassBelongsToSchool(schoolId, payload.classId);
        await this.ensureOptionalDepartmentBelongsToSchool(schoolId, payload.departmentId);
        await this.ensureOptionalSemesterBelongsToSchool(schoolId, payload.semesterId);
        return this.prisma.section.create({
            data: {
                schoolId,
                classId: payload.classId,
                departmentId: payload.departmentId,
                semesterId: payload.semesterId,
                semesterNumber: payload.semesterNumber,
                name: payload.name.trim(),
                roomLabel: payload.roomLabel?.trim(),
            },
        });
    }
    async updateSection(schoolId, sectionId, payload) {
        await this.ensureSectionBelongsToSchool(schoolId, sectionId);
        if (payload.classId) {
            await this.ensureClassBelongsToSchool(schoolId, payload.classId);
        }
        await this.ensureOptionalDepartmentBelongsToSchool(schoolId, payload.departmentId);
        await this.ensureOptionalSemesterBelongsToSchool(schoolId, payload.semesterId);
        return this.prisma.section.update({
            where: { id: sectionId },
            data: {
                classId: payload.classId,
                departmentId: payload.departmentId,
                semesterId: payload.semesterId,
                semesterNumber: payload.semesterNumber,
                name: payload.name?.trim(),
                roomLabel: payload.roomLabel?.trim(),
            },
        });
    }
    async removeSection(schoolId, sectionId) {
        await this.ensureSectionBelongsToSchool(schoolId, sectionId);
        await this.prisma.section.delete({ where: { id: sectionId } });
        return { message: 'Section deleted successfully' };
    }
    async createSubject(schoolId, payload) {
        await this.ensureOptionalDepartmentBelongsToSchool(schoolId, payload.departmentId);
        return this.prisma.subject.create({
            data: {
                schoolId,
                departmentId: payload.departmentId,
                code: payload.code.trim().toUpperCase(),
                name: payload.name.trim(),
                description: payload.description?.trim(),
                subjectType: payload.subjectType,
                credits: payload.credits,
                lectureHours: payload.lectureHours,
                practicalHours: payload.practicalHours,
                schemeVersion: payload.schemeVersion?.trim(),
                isElective: payload.isElective,
            },
        });
    }
    async updateSubject(schoolId, subjectId, payload) {
        await this.ensureSubjectBelongsToSchool(schoolId, subjectId);
        await this.ensureOptionalDepartmentBelongsToSchool(schoolId, payload.departmentId);
        return this.prisma.subject.update({
            where: { id: subjectId },
            data: {
                departmentId: payload.departmentId,
                code: payload.code?.trim().toUpperCase(),
                name: payload.name?.trim(),
                description: payload.description?.trim(),
                subjectType: payload.subjectType,
                credits: payload.credits,
                lectureHours: payload.lectureHours,
                practicalHours: payload.practicalHours,
                schemeVersion: payload.schemeVersion?.trim(),
                isElective: payload.isElective,
            },
        });
    }
    async removeSubject(schoolId, subjectId) {
        await this.ensureSubjectBelongsToSchool(schoolId, subjectId);
        await this.prisma.subject.delete({ where: { id: subjectId } });
        return { message: 'Subject deleted successfully' };
    }
    async createTerm(schoolId, payload) {
        if (payload.classId) {
            await this.ensureClassBelongsToSchool(schoolId, payload.classId);
        }
        return this.persistTerm(schoolId, {
            classId: payload.classId,
            name: payload.name.trim(),
            startDate: new Date(payload.startDate),
            endDate: new Date(payload.endDate),
            isActive: payload.isActive ?? false,
        });
    }
    async updateTerm(schoolId, termId, payload) {
        const existingTerm = await this.prisma.academicTerm.findFirst({
            where: {
                id: termId,
                schoolId,
            },
        });
        if (!existingTerm) {
            throw new common_1.NotFoundException('Academic term not found');
        }
        const classId = payload.classId ?? existingTerm.classId ?? undefined;
        if (classId) {
            await this.ensureClassBelongsToSchool(schoolId, classId);
        }
        return this.persistTerm(schoolId, {
            classId,
            name: payload.name?.trim() ?? existingTerm.name,
            startDate: payload.startDate ? new Date(payload.startDate) : existingTerm.startDate,
            endDate: payload.endDate ? new Date(payload.endDate) : existingTerm.endDate,
            isActive: payload.isActive ?? existingTerm.isActive,
        }, termId);
    }
    async removeTerm(schoolId, termId) {
        const term = await this.prisma.academicTerm.findFirst({
            where: {
                id: termId,
                schoolId,
            },
        });
        if (!term) {
            throw new common_1.NotFoundException('Academic term not found');
        }
        await this.prisma.academicTerm.delete({ where: { id: termId } });
        return { message: 'Academic term deleted successfully' };
    }
    async createAssignment(schoolId, payload) {
        await this.ensureTeacherBelongsToSchool(schoolId, payload.teacherId);
        await this.ensureClassBelongsToSchool(schoolId, payload.classId);
        await this.ensureSectionBelongsToSchool(schoolId, payload.sectionId);
        await this.ensureSubjectBelongsToSchool(schoolId, payload.subjectId);
        await this.ensureOptionalSubjectOfferingBelongsToSchool(schoolId, payload.subjectOfferingId);
        return this.prisma.teacherSubjectAssignment.create({
            data: {
                schoolId,
                teacherId: payload.teacherId,
                classId: payload.classId,
                sectionId: payload.sectionId,
                subjectId: payload.subjectId,
                subjectOfferingId: payload.subjectOfferingId,
                isClassLead: payload.isClassLead ?? false,
            },
        });
    }
    async updateAssignment(schoolId, assignmentId, payload) {
        const existingAssignment = await this.prisma.teacherSubjectAssignment.findFirst({
            where: {
                id: assignmentId,
                schoolId,
            },
        });
        if (!existingAssignment) {
            throw new common_1.NotFoundException('Teacher assignment not found');
        }
        const teacherId = payload.teacherId ?? existingAssignment.teacherId;
        const classId = payload.classId ?? existingAssignment.classId;
        const sectionId = payload.sectionId ?? existingAssignment.sectionId;
        const subjectId = payload.subjectId ?? existingAssignment.subjectId;
        await this.ensureTeacherBelongsToSchool(schoolId, teacherId);
        await this.ensureClassBelongsToSchool(schoolId, classId);
        await this.ensureSectionBelongsToSchool(schoolId, sectionId);
        await this.ensureSubjectBelongsToSchool(schoolId, subjectId);
        await this.ensureOptionalSubjectOfferingBelongsToSchool(schoolId, payload.subjectOfferingId ?? existingAssignment.subjectOfferingId ?? undefined);
        return this.prisma.teacherSubjectAssignment.update({
            where: { id: assignmentId },
            data: {
                teacherId,
                classId,
                sectionId,
                subjectId,
                subjectOfferingId: payload.subjectOfferingId,
                isClassLead: payload.isClassLead ?? existingAssignment.isClassLead,
            },
        });
    }
    async removeAssignment(schoolId, assignmentId) {
        const assignment = await this.prisma.teacherSubjectAssignment.findFirst({
            where: {
                id: assignmentId,
                schoolId,
            },
        });
        if (!assignment) {
            throw new common_1.NotFoundException('Teacher assignment not found');
        }
        await this.prisma.teacherSubjectAssignment.delete({ where: { id: assignmentId } });
        return { message: 'Teacher assignment deleted successfully' };
    }
    createDepartment(schoolId, payload) {
        return this.prisma.department.create({
            data: {
                schoolId,
                code: payload.code.trim().toUpperCase(),
                name: payload.name.trim(),
                shortName: payload.shortName?.trim(),
                schemeLabel: payload.schemeLabel?.trim(),
            },
        });
    }
    async updateDepartment(schoolId, departmentId, payload) {
        await this.ensureDepartmentBelongsToSchool(schoolId, departmentId);
        return this.prisma.department.update({
            where: { id: departmentId },
            data: {
                code: payload.code?.trim().toUpperCase(),
                name: payload.name?.trim(),
                shortName: payload.shortName?.trim(),
                schemeLabel: payload.schemeLabel?.trim(),
            },
        });
    }
    async removeDepartment(schoolId, departmentId) {
        await this.ensureDepartmentBelongsToSchool(schoolId, departmentId);
        await this.prisma.department.delete({ where: { id: departmentId } });
        return { message: 'Department deleted successfully' };
    }
    createAcademicYear(schoolId, payload) {
        return this.persistAcademicYear(schoolId, {
            name: payload.name.trim(),
            startYear: payload.startYear,
            endYear: payload.endYear,
            isActive: payload.isActive ?? false,
        });
    }
    async updateAcademicYear(schoolId, academicYearId, payload) {
        const academicYear = await this.prisma.academicYear.findFirst({
            where: { id: academicYearId, schoolId },
        });
        if (!academicYear) {
            throw new common_1.NotFoundException('Academic year not found');
        }
        return this.persistAcademicYear(schoolId, {
            name: payload.name?.trim() ?? academicYear.name,
            startYear: payload.startYear ?? academicYear.startYear,
            endYear: payload.endYear ?? academicYear.endYear,
            isActive: payload.isActive ?? academicYear.isActive,
        }, academicYearId);
    }
    async removeAcademicYear(schoolId, academicYearId) {
        await this.ensureAcademicYearBelongsToSchool(schoolId, academicYearId);
        await this.prisma.academicYear.delete({ where: { id: academicYearId } });
        return { message: 'Academic year deleted successfully' };
    }
    async createSemester(schoolId, payload) {
        await this.ensureDepartmentBelongsToSchool(schoolId, payload.departmentId);
        await this.ensureOptionalAcademicYearBelongsToSchool(schoolId, payload.academicYearId);
        return this.prisma.semester.create({
            data: {
                schoolId,
                departmentId: payload.departmentId,
                academicYearId: payload.academicYearId,
                number: payload.number,
                label: payload.label.trim(),
            },
        });
    }
    async updateSemester(schoolId, semesterId, payload) {
        const semester = await this.prisma.semester.findFirst({
            where: { id: semesterId, schoolId },
        });
        if (!semester) {
            throw new common_1.NotFoundException('Semester not found');
        }
        await this.ensureDepartmentBelongsToSchool(schoolId, payload.departmentId ?? semester.departmentId);
        await this.ensureOptionalAcademicYearBelongsToSchool(schoolId, payload.academicYearId ?? semester.academicYearId ?? undefined);
        return this.prisma.semester.update({
            where: { id: semesterId },
            data: {
                departmentId: payload.departmentId,
                academicYearId: payload.academicYearId,
                number: payload.number,
                label: payload.label?.trim(),
            },
        });
    }
    async removeSemester(schoolId, semesterId) {
        await this.ensureSemesterBelongsToSchool(schoolId, semesterId);
        await this.prisma.semester.delete({ where: { id: semesterId } });
        return { message: 'Semester deleted successfully' };
    }
    async createSubjectOffering(schoolId, payload) {
        await this.ensureDepartmentBelongsToSchool(schoolId, payload.departmentId);
        await this.ensureOptionalAcademicYearBelongsToSchool(schoolId, payload.academicYearId);
        await this.ensureSemesterBelongsToSchool(schoolId, payload.semesterId);
        await this.ensureSubjectBelongsToSchool(schoolId, payload.subjectId);
        await this.ensureOptionalSectionBelongsToSchool(schoolId, payload.sectionId);
        await this.ensureOptionalInternalMarksPolicyBelongsToSchool(schoolId, payload.internalMarksPolicyId);
        return this.prisma.subjectOffering.create({
            data: {
                schoolId,
                departmentId: payload.departmentId,
                academicYearId: payload.academicYearId,
                semesterId: payload.semesterId,
                sectionId: payload.sectionId,
                subjectId: payload.subjectId,
                internalMarksPolicyId: payload.internalMarksPolicyId,
                totalInternalMarks: payload.totalInternalMarks,
            },
        });
    }
    async updateSubjectOffering(schoolId, offeringId, payload) {
        const offering = await this.prisma.subjectOffering.findFirst({
            where: { id: offeringId, schoolId },
        });
        if (!offering) {
            throw new common_1.NotFoundException('Subject offering not found');
        }
        await this.ensureDepartmentBelongsToSchool(schoolId, payload.departmentId ?? offering.departmentId);
        await this.ensureOptionalAcademicYearBelongsToSchool(schoolId, payload.academicYearId ?? offering.academicYearId ?? undefined);
        await this.ensureSemesterBelongsToSchool(schoolId, payload.semesterId ?? offering.semesterId);
        await this.ensureSubjectBelongsToSchool(schoolId, payload.subjectId ?? offering.subjectId);
        await this.ensureOptionalSectionBelongsToSchool(schoolId, payload.sectionId ?? offering.sectionId ?? undefined);
        await this.ensureOptionalInternalMarksPolicyBelongsToSchool(schoolId, payload.internalMarksPolicyId ?? offering.internalMarksPolicyId ?? undefined);
        return this.prisma.subjectOffering.update({
            where: { id: offeringId },
            data: {
                departmentId: payload.departmentId,
                academicYearId: payload.academicYearId,
                semesterId: payload.semesterId,
                sectionId: payload.sectionId,
                subjectId: payload.subjectId,
                internalMarksPolicyId: payload.internalMarksPolicyId,
                totalInternalMarks: payload.totalInternalMarks,
            },
        });
    }
    async removeSubjectOffering(schoolId, offeringId) {
        await this.ensureSubjectOfferingBelongsToSchool(schoolId, offeringId);
        await this.prisma.subjectOffering.delete({ where: { id: offeringId } });
        return { message: 'Subject offering deleted successfully' };
    }
    async createInternalMarksPolicy(schoolId, payload) {
        await this.ensureOptionalDepartmentBelongsToSchool(schoolId, payload.departmentId);
        await this.ensureOptionalAcademicYearBelongsToSchool(schoolId, payload.academicYearId);
        await this.ensureOptionalSemesterBelongsToSchool(schoolId, payload.semesterId);
        return this.prisma.internalMarksPolicy.create({
            data: {
                schoolId,
                name: payload.name.trim(),
                departmentId: payload.departmentId,
                academicYearId: payload.academicYearId,
                semesterId: payload.semesterId,
                totalMarks: payload.totalMarks,
                attendanceThreshold: payload.attendanceThreshold,
                attendanceBonusMarks: payload.attendanceBonusMarks,
                components: {
                    create: payload.components.map((component, index) => ({
                        code: component.code.trim().toUpperCase(),
                        name: component.name.trim(),
                        maxMarks: component.maxMarks,
                        weightage: component.weightage,
                        displayOrder: component.displayOrder ?? index,
                    })),
                },
            },
            include: {
                components: {
                    orderBy: { displayOrder: 'asc' },
                },
            },
        });
    }
    async updateInternalMarksPolicy(schoolId, policyId, payload) {
        await this.ensureOptionalDepartmentBelongsToSchool(schoolId, payload.departmentId);
        await this.ensureOptionalAcademicYearBelongsToSchool(schoolId, payload.academicYearId);
        await this.ensureOptionalSemesterBelongsToSchool(schoolId, payload.semesterId);
        await this.ensureInternalMarksPolicyBelongsToSchool(schoolId, policyId);
        return this.prisma.$transaction(async (tx) => {
            await tx.assessmentComponent.deleteMany({
                where: { policyId },
            });
            return tx.internalMarksPolicy.update({
                where: { id: policyId },
                data: {
                    name: payload.name?.trim(),
                    departmentId: payload.departmentId,
                    academicYearId: payload.academicYearId,
                    semesterId: payload.semesterId,
                    totalMarks: payload.totalMarks,
                    attendanceThreshold: payload.attendanceThreshold,
                    attendanceBonusMarks: payload.attendanceBonusMarks,
                    components: payload.components
                        ? {
                            create: payload.components.map((component, index) => ({
                                code: component.code.trim().toUpperCase(),
                                name: component.name.trim(),
                                maxMarks: component.maxMarks,
                                weightage: component.weightage,
                                displayOrder: component.displayOrder ?? index,
                            })),
                        }
                        : undefined,
                },
                include: {
                    components: {
                        orderBy: { displayOrder: 'asc' },
                    },
                },
            });
        });
    }
    async removeInternalMarksPolicy(schoolId, policyId) {
        await this.ensureInternalMarksPolicyBelongsToSchool(schoolId, policyId);
        await this.prisma.internalMarksPolicy.delete({ where: { id: policyId } });
        return { message: 'Internal marks policy deleted successfully' };
    }
    async createTimetableEntry(schoolId, payload) {
        await this.ensureSectionBelongsToSchool(schoolId, payload.sectionId);
        await this.ensureSubjectBelongsToSchool(schoolId, payload.subjectId);
        await this.ensureOptionalTeacherBelongsToSchool(schoolId, payload.teacherId);
        await this.ensureOptionalSubjectOfferingBelongsToSchool(schoolId, payload.subjectOfferingId);
        return this.prisma.timetableEntry.create({
            data: {
                sectionId: payload.sectionId,
                subjectId: payload.subjectId,
                teacherId: payload.teacherId,
                subjectOfferingId: payload.subjectOfferingId,
                dayOfWeek: payload.dayOfWeek,
                periodLabel: payload.periodLabel?.trim(),
                startTime: payload.startTime.trim(),
                endTime: payload.endTime.trim(),
                roomLabel: payload.roomLabel?.trim(),
                teacherName: payload.teacherName?.trim(),
            },
        });
    }
    async updateTimetableEntry(schoolId, timetableEntryId, payload) {
        const entry = await this.prisma.timetableEntry.findFirst({
            where: {
                id: timetableEntryId,
                section: { schoolId },
            },
        });
        if (!entry) {
            throw new common_1.NotFoundException('Timetable entry not found');
        }
        await this.ensureSectionBelongsToSchool(schoolId, payload.sectionId ?? entry.sectionId);
        await this.ensureSubjectBelongsToSchool(schoolId, payload.subjectId ?? entry.subjectId);
        await this.ensureOptionalTeacherBelongsToSchool(schoolId, payload.teacherId ?? entry.teacherId ?? undefined);
        await this.ensureOptionalSubjectOfferingBelongsToSchool(schoolId, payload.subjectOfferingId ?? entry.subjectOfferingId ?? undefined);
        return this.prisma.timetableEntry.update({
            where: { id: timetableEntryId },
            data: {
                sectionId: payload.sectionId,
                subjectId: payload.subjectId,
                teacherId: payload.teacherId,
                subjectOfferingId: payload.subjectOfferingId,
                dayOfWeek: payload.dayOfWeek,
                periodLabel: payload.periodLabel?.trim(),
                startTime: payload.startTime?.trim(),
                endTime: payload.endTime?.trim(),
                roomLabel: payload.roomLabel?.trim(),
                teacherName: payload.teacherName?.trim(),
            },
        });
    }
    async removeTimetableEntry(schoolId, timetableEntryId) {
        const entry = await this.prisma.timetableEntry.findFirst({
            where: {
                id: timetableEntryId,
                section: { schoolId },
            },
            select: { id: true },
        });
        if (!entry) {
            throw new common_1.NotFoundException('Timetable entry not found');
        }
        await this.prisma.timetableEntry.delete({ where: { id: timetableEntryId } });
        return { message: 'Timetable entry deleted successfully' };
    }
    async persistTerm(schoolId, data, termId) {
        if (data.isActive) {
            await this.prisma.academicTerm.updateMany({
                where: {
                    schoolId,
                    classId: data.classId ?? null,
                    ...(termId ? { NOT: { id: termId } } : {}),
                },
                data: { isActive: false },
            });
        }
        if (termId) {
            return this.prisma.academicTerm.update({
                where: { id: termId },
                data,
            });
        }
        return this.prisma.academicTerm.create({
            data: {
                schoolId,
                ...data,
            },
        });
    }
    async persistAcademicYear(schoolId, data, academicYearId) {
        if (data.isActive) {
            await this.prisma.academicYear.updateMany({
                where: {
                    schoolId,
                    ...(academicYearId ? { NOT: { id: academicYearId } } : {}),
                },
                data: { isActive: false },
            });
        }
        if (academicYearId) {
            return this.prisma.academicYear.update({
                where: { id: academicYearId },
                data,
            });
        }
        return this.prisma.academicYear.create({
            data: {
                schoolId,
                ...data,
            },
        });
    }
    async ensureDepartmentBelongsToSchool(schoolId, departmentId) {
        const department = await this.prisma.department.findFirst({
            where: {
                id: departmentId,
                schoolId,
            },
            select: { id: true },
        });
        if (!department) {
            throw new common_1.NotFoundException('Department not found');
        }
    }
    async ensureOptionalDepartmentBelongsToSchool(schoolId, departmentId) {
        if (departmentId) {
            await this.ensureDepartmentBelongsToSchool(schoolId, departmentId);
        }
    }
    async ensureAcademicYearBelongsToSchool(schoolId, academicYearId) {
        const academicYear = await this.prisma.academicYear.findFirst({
            where: {
                id: academicYearId,
                schoolId,
            },
            select: { id: true },
        });
        if (!academicYear) {
            throw new common_1.NotFoundException('Academic year not found');
        }
    }
    async ensureOptionalAcademicYearBelongsToSchool(schoolId, academicYearId) {
        if (academicYearId) {
            await this.ensureAcademicYearBelongsToSchool(schoolId, academicYearId);
        }
    }
    async ensureSemesterBelongsToSchool(schoolId, semesterId) {
        const semester = await this.prisma.semester.findFirst({
            where: {
                id: semesterId,
                schoolId,
            },
            select: { id: true },
        });
        if (!semester) {
            throw new common_1.NotFoundException('Semester not found');
        }
    }
    async ensureOptionalSemesterBelongsToSchool(schoolId, semesterId) {
        if (semesterId) {
            await this.ensureSemesterBelongsToSchool(schoolId, semesterId);
        }
    }
    async ensureSubjectOfferingBelongsToSchool(schoolId, subjectOfferingId) {
        const offering = await this.prisma.subjectOffering.findFirst({
            where: {
                id: subjectOfferingId,
                schoolId,
            },
            select: { id: true },
        });
        if (!offering) {
            throw new common_1.NotFoundException('Subject offering not found');
        }
    }
    async ensureOptionalSubjectOfferingBelongsToSchool(schoolId, subjectOfferingId) {
        if (subjectOfferingId) {
            await this.ensureSubjectOfferingBelongsToSchool(schoolId, subjectOfferingId);
        }
    }
    async ensureInternalMarksPolicyBelongsToSchool(schoolId, policyId) {
        const policy = await this.prisma.internalMarksPolicy.findFirst({
            where: {
                id: policyId,
                schoolId,
            },
            select: { id: true },
        });
        if (!policy) {
            throw new common_1.NotFoundException('Internal marks policy not found');
        }
    }
    async ensureOptionalInternalMarksPolicyBelongsToSchool(schoolId, policyId) {
        if (policyId) {
            await this.ensureInternalMarksPolicyBelongsToSchool(schoolId, policyId);
        }
    }
    async ensureOptionalSectionBelongsToSchool(schoolId, sectionId) {
        if (sectionId) {
            await this.ensureSectionBelongsToSchool(schoolId, sectionId);
        }
    }
    async ensureClassBelongsToSchool(schoolId, classId) {
        const academicClass = await this.prisma.academicClass.findFirst({
            where: {
                id: classId,
                schoolId,
            },
            select: { id: true },
        });
        if (!academicClass) {
            throw new common_1.NotFoundException('Class not found');
        }
    }
    async ensureSectionBelongsToSchool(schoolId, sectionId) {
        const section = await this.prisma.section.findFirst({
            where: {
                id: sectionId,
                schoolId,
            },
            select: { id: true },
        });
        if (!section) {
            throw new common_1.NotFoundException('Section not found');
        }
    }
    async ensureSubjectBelongsToSchool(schoolId, subjectId) {
        const subject = await this.prisma.subject.findFirst({
            where: {
                id: subjectId,
                schoolId,
            },
            select: { id: true },
        });
        if (!subject) {
            throw new common_1.NotFoundException('Subject not found');
        }
    }
    async ensureTeacherBelongsToSchool(schoolId, teacherId) {
        const teacher = await this.prisma.teacher.findFirst({
            where: {
                id: teacherId,
                schoolId,
            },
            select: { id: true },
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Teacher not found');
        }
    }
    async ensureOptionalTeacherBelongsToSchool(schoolId, teacherId) {
        if (teacherId) {
            await this.ensureTeacherBelongsToSchool(schoolId, teacherId);
        }
    }
};
exports.AcademicsService = AcademicsService;
exports.AcademicsService = AcademicsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AcademicsService);
