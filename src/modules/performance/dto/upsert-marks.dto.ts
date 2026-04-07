import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class MarkEntryDto {
  @IsString()
  studentId!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  marksObtained!: number;

  @IsOptional()
  @IsString()
  @MaxLength(12)
  grade?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  remark?: string;
}

export class UpsertMarksDto {
  @IsString()
  assessmentId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MarkEntryDto)
  records!: MarkEntryDto[];
}
