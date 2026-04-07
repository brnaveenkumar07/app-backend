import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  list(@CurrentUser('schoolId') schoolId: string, @Query() query: PaginationQueryDto) {
    return this.studentsService.list(schoolId, query);
  }

  @Get('me')
  @Roles(Role.STUDENT)
  me(@CurrentUser('profileId') studentId: string) {
    return this.studentsService.getStudentProfile(studentId);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@CurrentUser('schoolId') schoolId: string, @Body() payload: CreateStudentDto) {
    return this.studentsService.create(schoolId, payload);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@CurrentUser('schoolId') schoolId: string, @Param('id') studentId: string, @Body() payload: UpdateStudentDto) {
    return this.studentsService.update(schoolId, studentId, payload);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@CurrentUser('schoolId') schoolId: string, @Param('id') studentId: string) {
    return this.studentsService.remove(schoolId, studentId);
  }
}
