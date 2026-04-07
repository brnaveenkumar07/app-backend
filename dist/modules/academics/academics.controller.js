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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicsController = void 0;
const common_1 = require("@nestjs/common");
const academics_service_1 = require("./academics.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
const manage_academics_dto_1 = require("./dto/manage-academics.dto");
let AcademicsController = class AcademicsController {
    academicsService;
    constructor(academicsService) {
        this.academicsService = academicsService;
    }
    adminOverview(schoolId) {
        return this.academicsService.getAdminOverview(schoolId);
    }
    studentTimetable(studentId) {
        return this.academicsService.getStudentTimetable(studentId);
    }
    createDepartment(schoolId, payload) {
        return this.academicsService.createDepartment(schoolId, payload);
    }
    updateDepartment(schoolId, departmentId, payload) {
        return this.academicsService.updateDepartment(schoolId, departmentId, payload);
    }
    removeDepartment(schoolId, departmentId) {
        return this.academicsService.removeDepartment(schoolId, departmentId);
    }
    createClass(schoolId, payload) {
        return this.academicsService.createClass(schoolId, payload);
    }
    updateClass(schoolId, classId, payload) {
        return this.academicsService.updateClass(schoolId, classId, payload);
    }
    removeClass(schoolId, classId) {
        return this.academicsService.removeClass(schoolId, classId);
    }
    createSection(schoolId, payload) {
        return this.academicsService.createSection(schoolId, payload);
    }
    updateSection(schoolId, sectionId, payload) {
        return this.academicsService.updateSection(schoolId, sectionId, payload);
    }
    removeSection(schoolId, sectionId) {
        return this.academicsService.removeSection(schoolId, sectionId);
    }
    createSubject(schoolId, payload) {
        return this.academicsService.createSubject(schoolId, payload);
    }
    updateSubject(schoolId, subjectId, payload) {
        return this.academicsService.updateSubject(schoolId, subjectId, payload);
    }
    removeSubject(schoolId, subjectId) {
        return this.academicsService.removeSubject(schoolId, subjectId);
    }
    createAcademicYear(schoolId, payload) {
        return this.academicsService.createAcademicYear(schoolId, payload);
    }
    updateAcademicYear(schoolId, academicYearId, payload) {
        return this.academicsService.updateAcademicYear(schoolId, academicYearId, payload);
    }
    removeAcademicYear(schoolId, academicYearId) {
        return this.academicsService.removeAcademicYear(schoolId, academicYearId);
    }
    createSemester(schoolId, payload) {
        return this.academicsService.createSemester(schoolId, payload);
    }
    updateSemester(schoolId, semesterId, payload) {
        return this.academicsService.updateSemester(schoolId, semesterId, payload);
    }
    removeSemester(schoolId, semesterId) {
        return this.academicsService.removeSemester(schoolId, semesterId);
    }
    createTerm(schoolId, payload) {
        return this.academicsService.createTerm(schoolId, payload);
    }
    updateTerm(schoolId, termId, payload) {
        return this.academicsService.updateTerm(schoolId, termId, payload);
    }
    removeTerm(schoolId, termId) {
        return this.academicsService.removeTerm(schoolId, termId);
    }
    createSubjectOffering(schoolId, payload) {
        return this.academicsService.createSubjectOffering(schoolId, payload);
    }
    updateSubjectOffering(schoolId, offeringId, payload) {
        return this.academicsService.updateSubjectOffering(schoolId, offeringId, payload);
    }
    removeSubjectOffering(schoolId, offeringId) {
        return this.academicsService.removeSubjectOffering(schoolId, offeringId);
    }
    createInternalMarksPolicy(schoolId, payload) {
        return this.academicsService.createInternalMarksPolicy(schoolId, payload);
    }
    updateInternalMarksPolicy(schoolId, policyId, payload) {
        return this.academicsService.updateInternalMarksPolicy(schoolId, policyId, payload);
    }
    removeInternalMarksPolicy(schoolId, policyId) {
        return this.academicsService.removeInternalMarksPolicy(schoolId, policyId);
    }
    createTimetableEntry(schoolId, payload) {
        return this.academicsService.createTimetableEntry(schoolId, payload);
    }
    updateTimetableEntry(schoolId, timetableEntryId, payload) {
        return this.academicsService.updateTimetableEntry(schoolId, timetableEntryId, payload);
    }
    removeTimetableEntry(schoolId, timetableEntryId) {
        return this.academicsService.removeTimetableEntry(schoolId, timetableEntryId);
    }
    createAssignment(schoolId, payload) {
        return this.academicsService.createAssignment(schoolId, payload);
    }
    updateAssignment(schoolId, assignmentId, payload) {
        return this.academicsService.updateAssignment(schoolId, assignmentId, payload);
    }
    removeAssignment(schoolId, assignmentId) {
        return this.academicsService.removeAssignment(schoolId, assignmentId);
    }
};
exports.AcademicsController = AcademicsController;
__decorate([
    (0, common_1.Get)('admin/overview'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "adminOverview", null);
__decorate([
    (0, common_1.Get)('student/timetable'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.STUDENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)('profileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "studentTimetable", null);
__decorate([
    (0, common_1.Post)('admin/departments'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, manage_academics_dto_1.CreateDepartmentDto]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "createDepartment", null);
__decorate([
    (0, common_1.Patch)('admin/departments/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, manage_academics_dto_1.UpdateDepartmentDto]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "updateDepartment", null);
__decorate([
    (0, common_1.Delete)('admin/departments/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "removeDepartment", null);
__decorate([
    (0, common_1.Post)('admin/classes'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, manage_academics_dto_1.CreateAcademicClassDto]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "createClass", null);
__decorate([
    (0, common_1.Patch)('admin/classes/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, manage_academics_dto_1.UpdateAcademicClassDto]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "updateClass", null);
__decorate([
    (0, common_1.Delete)('admin/classes/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "removeClass", null);
__decorate([
    (0, common_1.Post)('admin/sections'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, manage_academics_dto_1.CreateSectionDto]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "createSection", null);
__decorate([
    (0, common_1.Patch)('admin/sections/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, manage_academics_dto_1.UpdateSectionDto]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "updateSection", null);
__decorate([
    (0, common_1.Delete)('admin/sections/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "removeSection", null);
__decorate([
    (0, common_1.Post)('admin/subjects'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, manage_academics_dto_1.CreateSubjectDto]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "createSubject", null);
__decorate([
    (0, common_1.Patch)('admin/subjects/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, manage_academics_dto_1.UpdateSubjectDto]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "updateSubject", null);
__decorate([
    (0, common_1.Delete)('admin/subjects/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "removeSubject", null);
__decorate([
    (0, common_1.Post)('admin/academic-years'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, manage_academics_dto_1.CreateAcademicYearDto]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "createAcademicYear", null);
__decorate([
    (0, common_1.Patch)('admin/academic-years/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, manage_academics_dto_1.UpdateAcademicYearDto]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "updateAcademicYear", null);
__decorate([
    (0, common_1.Delete)('admin/academic-years/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "removeAcademicYear", null);
__decorate([
    (0, common_1.Post)('admin/semesters'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, manage_academics_dto_1.CreateSemesterDto]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "createSemester", null);
__decorate([
    (0, common_1.Patch)('admin/semesters/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, manage_academics_dto_1.UpdateSemesterDto]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "updateSemester", null);
__decorate([
    (0, common_1.Delete)('admin/semesters/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "removeSemester", null);
__decorate([
    (0, common_1.Post)('admin/terms'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, manage_academics_dto_1.CreateAcademicTermDto]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "createTerm", null);
__decorate([
    (0, common_1.Patch)('admin/terms/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, manage_academics_dto_1.UpdateAcademicTermDto]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "updateTerm", null);
__decorate([
    (0, common_1.Delete)('admin/terms/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "removeTerm", null);
__decorate([
    (0, common_1.Post)('admin/subject-offerings'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, manage_academics_dto_1.CreateSubjectOfferingDto]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "createSubjectOffering", null);
__decorate([
    (0, common_1.Patch)('admin/subject-offerings/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, manage_academics_dto_1.UpdateSubjectOfferingDto]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "updateSubjectOffering", null);
__decorate([
    (0, common_1.Delete)('admin/subject-offerings/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "removeSubjectOffering", null);
__decorate([
    (0, common_1.Post)('admin/internal-marks-policies'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, manage_academics_dto_1.CreateInternalMarksPolicyDto]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "createInternalMarksPolicy", null);
__decorate([
    (0, common_1.Patch)('admin/internal-marks-policies/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, manage_academics_dto_1.UpdateInternalMarksPolicyDto]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "updateInternalMarksPolicy", null);
__decorate([
    (0, common_1.Delete)('admin/internal-marks-policies/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "removeInternalMarksPolicy", null);
__decorate([
    (0, common_1.Post)('admin/timetable'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, manage_academics_dto_1.CreateTimetableEntryDto]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "createTimetableEntry", null);
__decorate([
    (0, common_1.Patch)('admin/timetable/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, manage_academics_dto_1.UpdateTimetableEntryDto]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "updateTimetableEntry", null);
__decorate([
    (0, common_1.Delete)('admin/timetable/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "removeTimetableEntry", null);
__decorate([
    (0, common_1.Post)('admin/assignments'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, manage_academics_dto_1.CreateTeacherAssignmentDto]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "createAssignment", null);
__decorate([
    (0, common_1.Patch)('admin/assignments/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, manage_academics_dto_1.UpdateTeacherAssignmentDto]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "updateAssignment", null);
__decorate([
    (0, common_1.Delete)('admin/assignments/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "removeAssignment", null);
exports.AcademicsController = AcademicsController = __decorate([
    (0, common_1.Controller)('academics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [academics_service_1.AcademicsService])
], AcademicsController);
