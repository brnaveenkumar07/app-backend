import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateTeacherDto {
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
  @MaxLength(80)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  employeeId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  aadhaarNumber?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  designation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  qualification?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  specialization?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  address?: string;
}
