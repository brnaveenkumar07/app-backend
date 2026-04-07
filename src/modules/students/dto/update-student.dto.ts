import { IsDateString, IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateStudentDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  mobileNumber?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsString()
  sectionId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  admissionNo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  rollNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  usn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  aadhaarNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  course?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  currentYear?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currentSemester?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  batchStartYear?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  lastName?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  gender?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  fatherName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  motherName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  parentPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  guardianName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  guardianPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  address?: string;
}
