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
exports.PerformanceController = void 0;
const common_1 = require("@nestjs/common");
const performance_service_1 = require("./performance.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const performance_query_dto_1 = require("./dto/performance-query.dto");
const create_assessment_dto_1 = require("./dto/create-assessment.dto");
const upsert_marks_dto_1 = require("./dto/upsert-marks.dto");
const create_student_remark_dto_1 = require("./dto/create-student-remark.dto");
let PerformanceController = class PerformanceController {
    performanceService;
    constructor(performanceService) {
        this.performanceService = performanceService;
    }
    adminOverview(schoolId) {
        return this.performanceService.getAdminOverview(schoolId);
    }
    teacherOverview(teacherId) {
        return this.performanceService.getTeacherOverview(teacherId);
    }
    teacherAssessments(teacherId, query) {
        return this.performanceService.listTeacherAssessments(teacherId, query);
    }
    createAssessment(teacherId, payload) {
        return this.performanceService.createAssessment(teacherId, payload);
    }
    upsertMarks(teacherId, payload) {
        return this.performanceService.upsertMarks(teacherId, payload);
    }
    createRemark(teacherId, payload) {
        return this.performanceService.createStudentRemark(teacherId, payload);
    }
    studentSummary(studentId) {
        return this.performanceService.getStudentSummary(studentId);
    }
};
exports.PerformanceController = PerformanceController;
__decorate([
    (0, common_1.Get)('admin/overview'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "adminOverview", null);
__decorate([
    (0, common_1.Get)('teacher/overview'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.TEACHER),
    __param(0, (0, current_user_decorator_1.CurrentUser)('profileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "teacherOverview", null);
__decorate([
    (0, common_1.Get)('teacher/assessments'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.TEACHER),
    __param(0, (0, current_user_decorator_1.CurrentUser)('profileId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, performance_query_dto_1.PerformanceQueryDto]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "teacherAssessments", null);
__decorate([
    (0, common_1.Post)('teacher/assessments'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.TEACHER),
    __param(0, (0, current_user_decorator_1.CurrentUser)('profileId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_assessment_dto_1.CreateAssessmentDto]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "createAssessment", null);
__decorate([
    (0, common_1.Post)('teacher/marks'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.TEACHER),
    __param(0, (0, current_user_decorator_1.CurrentUser)('profileId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upsert_marks_dto_1.UpsertMarksDto]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "upsertMarks", null);
__decorate([
    (0, common_1.Post)('teacher/remarks'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.TEACHER),
    __param(0, (0, current_user_decorator_1.CurrentUser)('profileId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_student_remark_dto_1.CreateStudentRemarkDto]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "createRemark", null);
__decorate([
    (0, common_1.Get)('student/summary'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.STUDENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)('profileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "studentSummary", null);
exports.PerformanceController = PerformanceController = __decorate([
    (0, common_1.Controller)('performance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [performance_service_1.PerformanceService])
], PerformanceController);
