import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Following } from './entities/following.entity';
import { NotifModule } from '../notif/notif.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Following]), NotifModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
