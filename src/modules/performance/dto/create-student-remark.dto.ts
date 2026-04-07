import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateStudentRemarkDto {
  @IsString()
  studentId!: string;

  @IsOptional()
  @IsString()
  termId?: string;

  @IsString()
  @MaxLength(500)
  content!: string;
}
