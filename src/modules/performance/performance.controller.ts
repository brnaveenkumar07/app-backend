import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PerformanceQueryDto } from './dto/performance-query.dto';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpsertMarksDto } from './dto/upsert-marks.dto';
import { CreateStudentRemarkDto } from './dto/create-student-remark.dto';

@Controller('performance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get('admin/overview')
  @Roles(Role.ADMIN)
  adminOverview(@CurrentUser('schoolId') schoolId: string) {
    return this.performanceService.getAdminOverview(schoolId);
  }

  @Get('teacher/overview')
  @Roles(Role.TEACHER)
  teacherOverview(@CurrentUser('profileId') teacherId: string) {
    return this.performanceService.getTeacherOverview(teacherId);
  }

  @Get('teacher/assessments')
  @Roles(Role.TEACHER)
  teacherAssessments(@CurrentUser('profileId') teacherId: string, @Query() query: PerformanceQueryDto) {
    return this.performanceService.listTeacherAssessments(teacherId, query);
  }

  @Post('teacher/assessments')
  @Roles(Role.TEACHER)
  createAssessment(@CurrentUser('profileId') teacherId: string, @Body() payload: CreateAssessmentDto) {
    return this.performanceService.createAssessment(teacherId, payload);
  }

  @Post('teacher/marks')
  @Roles(Role.TEACHER)
  upsertMarks(@CurrentUser('profileId') teacherId: string, @Body() payload: UpsertMarksDto) {
    return this.performanceService.upsertMarks(teacherId, payload);
  }

  @Post('teacher/remarks')
  @Roles(Role.TEACHER)
  createRemark(@CurrentUser('profileId') teacherId: string, @Body() payload: CreateStudentRemarkDto) {
    return this.performanceService.createStudentRemark(teacherId, payload);
  }

  @Get('student/summary')
  @Roles(Role.STUDENT)
  studentSummary(@CurrentUser('profileId') studentId: string) {
    return this.performanceService.getStudentSummary(studentId);
  }
}
