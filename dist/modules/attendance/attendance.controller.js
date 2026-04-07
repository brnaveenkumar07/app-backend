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
exports.AttendanceController = void 0;
const common_1 = require("@nestjs/common");
const attendance_service_1 = require("./attendance.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const upsert_attendance_dto_1 = require("./dto/upsert-attendance.dto");
const attendance_query_dto_1 = require("./dto/attendance-query.dto");
let AttendanceController = class AttendanceController {
    attendanceService;
    constructor(attendanceService) {
        this.attendanceService = attendanceService;
    }
    teacherSessions(teacherId, query) {
        return this.attendanceService.getTeacherAttendanceSessions(teacherId, query);
    }
    teacherWorkspace(teacherId) {
        return this.attendanceService.getTeacherWorkspace(teacherId);
    }
    teacherRoster(teacherId, sectionId) {
        return this.attendanceService.getTeacherRoster(teacherId, sectionId);
    }
    upsertAttendance(teacherId, payload) {
        return this.attendanceService.upsertAttendance(teacherId, payload);
    }
    studentSummary(studentId, query) {
        return this.attendanceService.getStudentAttendanceSummary(studentId, query.date);
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, common_1.Get)('teacher/sessions'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.TEACHER),
    __param(0, (0, current_user_decorator_1.CurrentUser)('profileId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, attendance_query_dto_1.AttendanceQueryDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "teacherSessions", null);
__decorate([
    (0, common_1.Get)('teacher/workspace'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.TEACHER),
    __param(0, (0, current_user_decorator_1.CurrentUser)('profileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "teacherWorkspace", null);
__decorate([
    (0, common_1.Get)('teacher/roster'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.TEACHER),
    __param(0, (0, current_user_decorator_1.CurrentUser)('profileId')),
    __param(1, (0, common_1.Query)('sectionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "teacherRoster", null);
__decorate([
    (0, common_1.Post)('teacher/mark'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.TEACHER),
    __param(0, (0, current_user_decorator_1.CurrentUser)('profileId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upsert_attendance_dto_1.UpsertAttendanceDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "upsertAttendance", null);
__decorate([
    (0, common_1.Get)('student/summary'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.STUDENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)('profileId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, attendance_query_dto_1.AttendanceQueryDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "studentSummary", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, common_1.Controller)('attendance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService])
], AttendanceController);
