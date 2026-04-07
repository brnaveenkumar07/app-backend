import { AttendanceStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class AttendanceRecordInput {
  @IsString()
  studentId!: string;

  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpsertAttendanceDto {
  @IsString()
  sectionId!: string;

  @IsString()
  subjectId!: string;

  @IsOptional()
  @IsString()
  termId?: string;

  @IsDateString()
  date!: string;

  @IsInt()
  @Min(1)
  @Max(7)
  slotNumber!: number;

  @IsOptional()
  @IsString()
  hourLabel?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordInput)
  records!: AttendanceRecordInput[];
}
