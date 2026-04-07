import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Controller('teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get('assignments')
  @Roles(Role.TEACHER)
  assignments(@CurrentUser('profileId') teacherId: string) {
    return this.teachersService.getAssignments(teacherId);
  }

  @Get()
  @Roles(Role.ADMIN)
  list(@CurrentUser('schoolId') schoolId: string, @Query() query: PaginationQueryDto) {
    return this.teachersService.list(schoolId, query);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@CurrentUser('schoolId') schoolId: string, @Body() payload: CreateTeacherDto) {
    return this.teachersService.create(schoolId, payload);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@CurrentUser('schoolId') schoolId: string, @Param('id') teacherId: string, @Body() payload: UpdateTeacherDto) {
    return this.teachersService.update(schoolId, teacherId, payload);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@CurrentUser('schoolId') schoolId: string, @Param('id') teacherId: string) {
    return this.teachersService.remove(schoolId, teacherId);
  }
}
