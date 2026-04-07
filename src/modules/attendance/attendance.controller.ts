import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpsertAttendanceDto } from './dto/upsert-attendance.dto';
import { AttendanceQueryDto } from './dto/attendance-query.dto';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('teacher/sessions')
  @Roles(Role.TEACHER)
  teacherSessions(@CurrentUser('profileId') teacherId: string, @Query() query: AttendanceQueryDto) {
    return this.attendanceService.getTeacherAttendanceSessions(teacherId, query);
  }

  @Get('teacher/workspace')
  @Roles(Role.TEACHER)
  teacherWorkspace(@CurrentUser('profileId') teacherId: string) {
    return this.attendanceService.getTeacherWorkspace(teacherId);
  }

  @Get('teacher/roster')
  @Roles(Role.TEACHER)
  teacherRoster(@CurrentUser('profileId') teacherId: string, @Query('sectionId') sectionId: string) {
    return this.attendanceService.getTeacherRoster(teacherId, sectionId);
  }

  @Post('teacher/mark')
  @Roles(Role.TEACHER)
  upsertAttendance(@CurrentUser('profileId') teacherId: string, @Body() payload: UpsertAttendanceDto) {
    return this.attendanceService.upsertAttendance(teacherId, payload);
  }

  @Get('student/summary')
  @Roles(Role.STUDENT)
  studentSummary(@CurrentUser('profileId') studentId: string, @Query() query: AttendanceQueryDto) {
    return this.attendanceService.getStudentAttendanceSummary(studentId, query.date);
  }
}
