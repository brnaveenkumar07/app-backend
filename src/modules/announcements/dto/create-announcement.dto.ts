import { AnnouncementAudience, UserRole } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAnnouncementDto {
  @IsString()
  @MaxLength(120)
  title!: string;

  @IsString()
  @MaxLength(1200)
  content!: string;

  @IsEnum(AnnouncementAudience)
  audience!: AnnouncementAudience;

  @IsOptional()
  @IsEnum(UserRole)
  audienceRole?: UserRole;

  @IsOptional()
  @IsString()
  sectionId?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
