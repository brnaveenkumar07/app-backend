import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'node:path';
import { AppConfigModule } from './config/app-config.module';
import { PrismaModule } from './config/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SchoolsModule } from './modules/schools/schools.module';
import { PerformanceModule } from './modules/performance/performance.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AcademicsModule } from './modules/academics/academics.module';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      envFilePath: [
        resolve(process.cwd(), '.env'),
        resolve(process.cwd(), 'apps/api/.env'),
      ],
    }),
    AppConfigModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    StudentsModule,
    TeachersModule,
    AttendanceModule,
    DashboardModule,
    SchoolsModule,
    PerformanceModule,
    AnnouncementsModule,
    NotificationsModule,
    AcademicsModule,
  ],
})
export class AppModule {}
