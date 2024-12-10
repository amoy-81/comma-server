import { Module } from '@nestjs/common';
import { NotifService } from './notif.service';
import { NotifController } from './notif.controller';
import { Notif } from './entities/notif.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Notif])],
  controllers: [NotifController],
  providers: [NotifService],
  exports: [NotifService],
})
export class NotifModule {}
