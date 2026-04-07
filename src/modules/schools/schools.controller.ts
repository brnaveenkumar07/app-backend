import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Controller('schools')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Get()
  @Roles(Role.ADMIN)
  list() {
    return this.schoolsService.list();
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() payload: CreateSchoolDto) {
    return this.schoolsService.create(payload);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') schoolId: string, @Body() payload: UpdateSchoolDto) {
    return this.schoolsService.update(schoolId, payload);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') schoolId: string) {
    return this.schoolsService.remove(schoolId);
  }
}
