"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const node_path_1 = require("node:path");
const app_config_module_1 = require("./config/app-config.module");
const prisma_module_1 = require("./config/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const students_module_1 = require("./modules/students/students.module");
const teachers_module_1 = require("./modules/teachers/teachers.module");
const attendance_module_1 = require("./modules/attendance/attendance.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const schools_module_1 = require("./modules/schools/schools.module");
const performance_module_1 = require("./modules/performance/performance.module");
const announcements_module_1 = require("./modules/announcements/announcements.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const academics_module_1 = require("./modules/academics/academics.module");
const app_controller_1 = require("./app.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        controllers: [app_controller_1.AppController],
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                expandVariables: true,
                envFilePath: [
                    (0, node_path_1.resolve)(process.cwd(), '.env'),
                    (0, node_path_1.resolve)(process.cwd(), 'apps/api/.env'),
                ],
            }),
            app_config_module_1.AppConfigModule,
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            students_module_1.StudentsModule,
            teachers_module_1.TeachersModule,
            attendance_module_1.AttendanceModule,
            dashboard_module_1.DashboardModule,
            schools_module_1.SchoolsModule,
            performance_module_1.PerformanceModule,
            announcements_module_1.AnnouncementsModule,
            notifications_module_1.NotificationsModule,
            academics_module_1.AcademicsModule,
        ],
    })
], AppModule);
