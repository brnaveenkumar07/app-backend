import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('me')
  listForUser(@CurrentUser('sub') userId: string) {
    return this.notificationsService.listForUser(userId);
  }

  @Patch(':id/read')
  markAsRead(@CurrentUser('sub') userId: string, @Param('id') notificationId: string) {
    return this.notificationsService.markAsRead(userId, notificationId);
  }
}
