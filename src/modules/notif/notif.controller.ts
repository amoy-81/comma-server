import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { NotifService } from './notif.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('notif')
export class NotifController {
  constructor(private readonly notificationsService: NotifService) {}

  @Get('read')
  @UseGuards(JwtAuthGuard)
  async getReadNotifs(@Req() req: any) {
    const readNotif = await this.notificationsService.getReadNotifications(
      req.user.id,
    );

    return readNotif;
  }

  @Get('unread')
  @UseGuards(JwtAuthGuard)
  async getUnreadNotifs(@Req() req: any) {
    const unreadNotif = await this.notificationsService.getUnreadNotifications(
      req.user.id,
    );

    return unreadNotif;
  }

  @Get('unread/count')
  @UseGuards(JwtAuthGuard)
  async getUnreadNotifsCount(@Req() req: any) {
    const countUnreadNotif =
      await this.notificationsService.countUnreadNotifications(req.user.id);

    return { count: countUnreadNotif };
  }
}
