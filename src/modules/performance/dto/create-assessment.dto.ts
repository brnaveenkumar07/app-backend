import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { AssessmentType } from '@prisma/client';

export class CreateAssessmentDto {
  @IsString()
  sectionId!: string;

  @IsString()
  subjectId!: string;

  @IsOptional()
  @IsString()
  termId?: string;

  @IsString()
  title!: string;

  @IsEnum(AssessmentType)
  type!: AssessmentType;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxMarks!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  weightage?: number;

  @IsOptional()
  @IsDateString()
  scheduledFor?: string;
}
