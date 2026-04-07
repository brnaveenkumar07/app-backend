import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTeacherDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  mobileNumber?: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MaxLength(80)
  firstName!: string;

  @IsString()
  @MaxLength(80)
  lastName!: string;

  @IsString()
  @MaxLength(40)
  employeeId!: string;

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
