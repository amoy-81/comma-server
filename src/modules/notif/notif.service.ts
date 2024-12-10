import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notif, NotifSubject } from './entities/notif.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class NotifService {
  constructor(
    @InjectRepository(Notif)
    private readonly notificationRepository: Repository<Notif>,
  ) {}

  async createNotif(
    senderId: number,
    receiverId: number,
    subject: NotifSubject,
    message: string,
  ) {
    const newNotif = this.notificationRepository.create({
      senderId,
      receiverId,
      message,
      subject,
    });

    return this.notificationRepository.save(newNotif);
  }

  async getReadNotifications(receiverId: number) {
    const notifs = this.notificationRepository.find({
      where: { receiverId, isRead: true },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      take: 15,
    });

    return plainToInstance(Notif, notifs);
  }

  async getUnreadNotifications(receiverId: number) {
    const notifs = await this.notificationRepository.find({
      where: { receiverId, isRead: false },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
      take: 50,
    });

    const notifIds = notifs.map((notif) => notif.id);

    await this.notificationRepository
      .createQueryBuilder()
      .update(Notif)
      .set({ isRead: true })
      .whereInIds(notifIds)
      .execute();

    return plainToInstance(Notif, notifs);
  }

  async countUnreadNotifications(receiverId: number) {
    return this.notificationRepository.count({
      where: { receiverId, isRead: false },
    });
  }
}
