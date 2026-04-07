import { IsOptional, IsString } from 'class-validator';

export class PerformanceQueryDto {
  @IsOptional()
  @IsString()
  sectionId?: string;

  @IsOptional()
  @IsString()
  subjectId?: string;

  @IsOptional()
  @IsString()
  termId?: string;
}
