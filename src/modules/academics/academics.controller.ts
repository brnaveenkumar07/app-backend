import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AcademicsService } from './academics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import {
  CreateAcademicClassDto,
  CreateAcademicTermDto,
  CreateAcademicYearDto,
  CreateDepartmentDto,
  CreateInternalMarksPolicyDto,
  CreateSectionDto,
  CreateSemesterDto,
  CreateSubjectDto,
  CreateSubjectOfferingDto,
  CreateTeacherAssignmentDto,
  CreateTimetableEntryDto,
  UpdateAcademicClassDto,
  UpdateAcademicTermDto,
  UpdateAcademicYearDto,
  UpdateDepartmentDto,
  UpdateInternalMarksPolicyDto,
  UpdateSectionDto,
  UpdateSemesterDto,
  UpdateSubjectDto,
  UpdateSubjectOfferingDto,
  UpdateTeacherAssignmentDto,
  UpdateTimetableEntryDto,
} from './dto/manage-academics.dto';

@Controller('academics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AcademicsController {
  constructor(private readonly academicsService: AcademicsService) {}

  @Get('admin/overview')
  @Roles(Role.ADMIN)
  adminOverview(@CurrentUser('schoolId') schoolId: string) {
    return this.academicsService.getAdminOverview(schoolId);
  }

  @Get('student/timetable')
  @Roles(Role.STUDENT)
  studentTimetable(@CurrentUser('profileId') studentId: string) {
    return this.academicsService.getStudentTimetable(studentId);
  }

  @Post('admin/departments')
  @Roles(Role.ADMIN)
  createDepartment(@CurrentUser('schoolId') schoolId: string, @Body() payload: CreateDepartmentDto) {
    return this.academicsService.createDepartment(schoolId, payload);
  }

  @Patch('admin/departments/:id')
  @Roles(Role.ADMIN)
  updateDepartment(@CurrentUser('schoolId') schoolId: string, @Param('id') departmentId: string, @Body() payload: UpdateDepartmentDto) {
    return this.academicsService.updateDepartment(schoolId, departmentId, payload);
  }

  @Delete('admin/departments/:id')
  @Roles(Role.ADMIN)
  removeDepartment(@CurrentUser('schoolId') schoolId: string, @Param('id') departmentId: string) {
    return this.academicsService.removeDepartment(schoolId, departmentId);
  }

  @Post('admin/classes')
  @Roles(Role.ADMIN)
  createClass(@CurrentUser('schoolId') schoolId: string, @Body() payload: CreateAcademicClassDto) {
    return this.academicsService.createClass(schoolId, payload);
  }

  @Patch('admin/classes/:id')
  @Roles(Role.ADMIN)
  updateClass(@CurrentUser('schoolId') schoolId: string, @Param('id') classId: string, @Body() payload: UpdateAcademicClassDto) {
    return this.academicsService.updateClass(schoolId, classId, payload);
  }

  @Delete('admin/classes/:id')
  @Roles(Role.ADMIN)
  removeClass(@CurrentUser('schoolId') schoolId: string, @Param('id') classId: string) {
    return this.academicsService.removeClass(schoolId, classId);
  }

  @Post('admin/sections')
  @Roles(Role.ADMIN)
  createSection(@CurrentUser('schoolId') schoolId: string, @Body() payload: CreateSectionDto) {
    return this.academicsService.createSection(schoolId, payload);
  }

  @Patch('admin/sections/:id')
  @Roles(Role.ADMIN)
  updateSection(@CurrentUser('schoolId') schoolId: string, @Param('id') sectionId: string, @Body() payload: UpdateSectionDto) {
    return this.academicsService.updateSection(schoolId, sectionId, payload);
  }

  @Delete('admin/sections/:id')
  @Roles(Role.ADMIN)
  removeSection(@CurrentUser('schoolId') schoolId: string, @Param('id') sectionId: string) {
    return this.academicsService.removeSection(schoolId, sectionId);
  }

  @Post('admin/subjects')
  @Roles(Role.ADMIN)
  createSubject(@CurrentUser('schoolId') schoolId: string, @Body() payload: CreateSubjectDto) {
    return this.academicsService.createSubject(schoolId, payload);
  }

  @Patch('admin/subjects/:id')
  @Roles(Role.ADMIN)
  updateSubject(@CurrentUser('schoolId') schoolId: string, @Param('id') subjectId: string, @Body() payload: UpdateSubjectDto) {
    return this.academicsService.updateSubject(schoolId, subjectId, payload);
  }

  @Delete('admin/subjects/:id')
  @Roles(Role.ADMIN)
  removeSubject(@CurrentUser('schoolId') schoolId: string, @Param('id') subjectId: string) {
    return this.academicsService.removeSubject(schoolId, subjectId);
  }

  @Post('admin/academic-years')
  @Roles(Role.ADMIN)
  createAcademicYear(@CurrentUser('schoolId') schoolId: string, @Body() payload: CreateAcademicYearDto) {
    return this.academicsService.createAcademicYear(schoolId, payload);
  }

  @Patch('admin/academic-years/:id')
  @Roles(Role.ADMIN)
  updateAcademicYear(@CurrentUser('schoolId') schoolId: string, @Param('id') academicYearId: string, @Body() payload: UpdateAcademicYearDto) {
    return this.academicsService.updateAcademicYear(schoolId, academicYearId, payload);
  }

  @Delete('admin/academic-years/:id')
  @Roles(Role.ADMIN)
  removeAcademicYear(@CurrentUser('schoolId') schoolId: string, @Param('id') academicYearId: string) {
    return this.academicsService.removeAcademicYear(schoolId, academicYearId);
  }

  @Post('admin/semesters')
  @Roles(Role.ADMIN)
  createSemester(@CurrentUser('schoolId') schoolId: string, @Body() payload: CreateSemesterDto) {
    return this.academicsService.createSemester(schoolId, payload);
  }

  @Patch('admin/semesters/:id')
  @Roles(Role.ADMIN)
  updateSemester(@CurrentUser('schoolId') schoolId: string, @Param('id') semesterId: string, @Body() payload: UpdateSemesterDto) {
    return this.academicsService.updateSemester(schoolId, semesterId, payload);
  }

  @Delete('admin/semesters/:id')
  @Roles(Role.ADMIN)
  removeSemester(@CurrentUser('schoolId') schoolId: string, @Param('id') semesterId: string) {
    return this.academicsService.removeSemester(schoolId, semesterId);
  }

  @Post('admin/terms')
  @Roles(Role.ADMIN)
  createTerm(@CurrentUser('schoolId') schoolId: string, @Body() payload: CreateAcademicTermDto) {
    return this.academicsService.createTerm(schoolId, payload);
  }

  @Patch('admin/terms/:id')
  @Roles(Role.ADMIN)
  updateTerm(@CurrentUser('schoolId') schoolId: string, @Param('id') termId: string, @Body() payload: UpdateAcademicTermDto) {
    return this.academicsService.updateTerm(schoolId, termId, payload);
  }

  @Delete('admin/terms/:id')
  @Roles(Role.ADMIN)
  removeTerm(@CurrentUser('schoolId') schoolId: string, @Param('id') termId: string) {
    return this.academicsService.removeTerm(schoolId, termId);
  }

  @Post('admin/subject-offerings')
  @Roles(Role.ADMIN)
  createSubjectOffering(@CurrentUser('schoolId') schoolId: string, @Body() payload: CreateSubjectOfferingDto) {
    return this.academicsService.createSubjectOffering(schoolId, payload);
  }

  @Patch('admin/subject-offerings/:id')
  @Roles(Role.ADMIN)
  updateSubjectOffering(@CurrentUser('schoolId') schoolId: string, @Param('id') offeringId: string, @Body() payload: UpdateSubjectOfferingDto) {
    return this.academicsService.updateSubjectOffering(schoolId, offeringId, payload);
  }

  @Delete('admin/subject-offerings/:id')
  @Roles(Role.ADMIN)
  removeSubjectOffering(@CurrentUser('schoolId') schoolId: string, @Param('id') offeringId: string) {
    return this.academicsService.removeSubjectOffering(schoolId, offeringId);
  }

  @Post('admin/internal-marks-policies')
  @Roles(Role.ADMIN)
  createInternalMarksPolicy(@CurrentUser('schoolId') schoolId: string, @Body() payload: CreateInternalMarksPolicyDto) {
    return this.academicsService.createInternalMarksPolicy(schoolId, payload);
  }

  @Patch('admin/internal-marks-policies/:id')
  @Roles(Role.ADMIN)
  updateInternalMarksPolicy(@CurrentUser('schoolId') schoolId: string, @Param('id') policyId: string, @Body() payload: UpdateInternalMarksPolicyDto) {
    return this.academicsService.updateInternalMarksPolicy(schoolId, policyId, payload);
  }

  @Delete('admin/internal-marks-policies/:id')
  @Roles(Role.ADMIN)
  removeInternalMarksPolicy(@CurrentUser('schoolId') schoolId: string, @Param('id') policyId: string) {
    return this.academicsService.removeInternalMarksPolicy(schoolId, policyId);
  }

  @Post('admin/timetable')
  @Roles(Role.ADMIN)
  createTimetableEntry(@CurrentUser('schoolId') schoolId: string, @Body() payload: CreateTimetableEntryDto) {
    return this.academicsService.createTimetableEntry(schoolId, payload);
  }

  @Patch('admin/timetable/:id')
  @Roles(Role.ADMIN)
  updateTimetableEntry(@CurrentUser('schoolId') schoolId: string, @Param('id') timetableEntryId: string, @Body() payload: UpdateTimetableEntryDto) {
    return this.academicsService.updateTimetableEntry(schoolId, timetableEntryId, payload);
  }

  @Delete('admin/timetable/:id')
  @Roles(Role.ADMIN)
  removeTimetableEntry(@CurrentUser('schoolId') schoolId: string, @Param('id') timetableEntryId: string) {
    return this.academicsService.removeTimetableEntry(schoolId, timetableEntryId);
  }

  @Post('admin/assignments')
  @Roles(Role.ADMIN)
  createAssignment(@CurrentUser('schoolId') schoolId: string, @Body() payload: CreateTeacherAssignmentDto) {
    return this.academicsService.createAssignment(schoolId, payload);
  }

  @Patch('admin/assignments/:id')
  @Roles(Role.ADMIN)
  updateAssignment(@CurrentUser('schoolId') schoolId: string, @Param('id') assignmentId: string, @Body() payload: UpdateTeacherAssignmentDto) {
    return this.academicsService.updateAssignment(schoolId, assignmentId, payload);
  }

  @Delete('admin/assignments/:id')
  @Roles(Role.ADMIN)
  removeAssignment(@CurrentUser('schoolId') schoolId: string, @Param('id') assignmentId: string) {
    return this.academicsService.removeAssignment(schoolId, assignmentId);
  }
}
