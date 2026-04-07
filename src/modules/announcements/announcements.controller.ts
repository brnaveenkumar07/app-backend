import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@Controller('announcements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  list(@CurrentUser() user: { role: string; profileId?: string; schoolId?: string }) {
    return this.announcementsService.listForUser(user as never);
  }

  @Post()
  create(
    @CurrentUser() user: { role: string; profileId?: string; schoolId?: string },
    @Body() payload: CreateAnnouncementDto,
  ) {
    return this.announcementsService.create(user as never, payload);
  }
}
