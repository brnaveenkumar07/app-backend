import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @Roles(Role.ADMIN)
  admin(@CurrentUser('schoolId') schoolId: string) {
    return this.dashboardService.getAdminDashboard(schoolId);
  }

  @Get('teacher')
  @Roles(Role.TEACHER)
  teacher(@CurrentUser('profileId') teacherId: string) {
    return this.dashboardService.getTeacherDashboard(teacherId);
  }

  @Get('student')
  @Roles(Role.STUDENT)
  student(@CurrentUser('profileId') studentId: string) {
    return this.dashboardService.getStudentDashboard(studentId);
  }
}
