import { Type } from 'class-transformer';
import { SubjectType } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateAcademicClassDto {
  @IsString()
  @MaxLength(80)
  name!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  gradeLevel!: number;
}

export class UpdateAcademicClassDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  gradeLevel?: number;
}

export class CreateSectionDto {
  @IsString()
  classId!: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  semesterId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(8)
  semesterNumber?: number;

  @IsString()
  @MaxLength(20)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  roomLabel?: string;
}

export class UpdateSectionDto {
  @IsOptional()
  @IsString()
  classId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  semesterId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(8)
  semesterNumber?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  roomLabel?: string;
}

export class CreateSubjectDto {
  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsString()
  @MaxLength(30)
  code!: string;

  @IsString()
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  description?: string;

  @IsOptional()
  @IsEnum(SubjectType)
  subjectType?: SubjectType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  credits?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  lectureHours?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  practicalHours?: number;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  schemeVersion?: string;

  @IsOptional()
  @IsBoolean()
  isElective?: boolean;
}

export class UpdateSubjectDto {
  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  description?: string;

  @IsOptional()
  @IsEnum(SubjectType)
  subjectType?: SubjectType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  credits?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  lectureHours?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  practicalHours?: number;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  schemeVersion?: string;

  @IsOptional()
  @IsBoolean()
  isElective?: boolean;
}

export class CreateAcademicTermDto {
  @IsOptional()
  @IsString()
  classId?: string;

  @IsString()
  @MaxLength(80)
  name!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAcademicTermDto {
  @IsOptional()
  @IsString()
  classId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateTeacherAssignmentDto {
  @IsString()
  teacherId!: string;

  @IsString()
  classId!: string;

  @IsString()
  sectionId!: string;

  @IsString()
  subjectId!: string;

  @IsOptional()
  @IsString()
  subjectOfferingId?: string;

  @IsOptional()
  @IsBoolean()
  isClassLead?: boolean;
}

export class UpdateTeacherAssignmentDto {
  @IsOptional()
  @IsString()
  teacherId?: string;

  @IsOptional()
  @IsString()
  classId?: string;

  @IsOptional()
  @IsString()
  sectionId?: string;

  @IsOptional()
  @IsString()
  subjectId?: string;

  @IsOptional()
  @IsString()
  subjectOfferingId?: string;

  @IsOptional()
  @IsBoolean()
  isClassLead?: boolean;
}

export class CreateDepartmentDto {
  @IsString()
  @MaxLength(20)
  code!: string;

  @IsString()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  shortName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  schemeLabel?: string;
}

export class UpdateDepartmentDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  shortName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  schemeLabel?: string;
}

export class CreateAcademicYearDto {
  @IsString()
  @MaxLength(40)
  name!: string;

  @Type(() => Number)
  @IsInt()
  startYear!: number;

  @Type(() => Number)
  @IsInt()
  endYear!: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAcademicYearDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  startYear?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  endYear?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateSemesterDto {
  @IsString()
  departmentId!: string;

  @IsOptional()
  @IsString()
  academicYearId?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(8)
  number!: number;

  @IsString()
  @MaxLength(60)
  label!: string;
}

export class UpdateSemesterDto {
  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  academicYearId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(8)
  number?: number;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  label?: string;
}

export class CreateSubjectOfferingDto {
  @IsString()
  departmentId!: string;

  @IsOptional()
  @IsString()
  academicYearId?: string;

  @IsString()
  semesterId!: string;

  @IsOptional()
  @IsString()
  sectionId?: string;

  @IsString()
  subjectId!: string;

  @IsOptional()
  @IsString()
  internalMarksPolicyId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  totalInternalMarks?: number;
}

export class UpdateSubjectOfferingDto {
  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  academicYearId?: string;

  @IsOptional()
  @IsString()
  semesterId?: string;

  @IsOptional()
  @IsString()
  sectionId?: string;

  @IsOptional()
  @IsString()
  subjectId?: string;

  @IsOptional()
  @IsString()
  internalMarksPolicyId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  totalInternalMarks?: number;
}

export class AssessmentComponentInputDto {
  @IsString()
  @MaxLength(20)
  code!: string;

  @IsString()
  @MaxLength(80)
  name!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  maxMarks!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  weightage?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  displayOrder?: number;
}

export class CreateInternalMarksPolicyDto {
  @IsString()
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  academicYearId?: string;

  @IsOptional()
  @IsString()
  semesterId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  totalMarks?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  attendanceThreshold?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  attendanceBonusMarks?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssessmentComponentInputDto)
  components!: AssessmentComponentInputDto[];
}

export class UpdateInternalMarksPolicyDto extends CreateInternalMarksPolicyDto {}

export class CreateTimetableEntryDto {
  @IsString()
  sectionId!: string;

  @IsString()
  subjectId!: string;

  @IsOptional()
  @IsString()
  teacherId?: string;

  @IsOptional()
  @IsString()
  subjectOfferingId?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(7)
  dayOfWeek!: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  periodLabel?: string;

  @IsString()
  @MaxLength(20)
  startTime!: string;

  @IsString()
  @MaxLength(20)
  endTime!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  roomLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  teacherName?: string;
}

export class UpdateTimetableEntryDto {
  @IsOptional()
  @IsString()
  sectionId?: string;

  @IsOptional()
  @IsString()
  subjectId?: string;

  @IsOptional()
  @IsString()
  teacherId?: string;

  @IsOptional()
  @IsString()
  subjectOfferingId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(7)
  dayOfWeek?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  periodLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  startTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  endTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  roomLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  teacherName?: string;
}
