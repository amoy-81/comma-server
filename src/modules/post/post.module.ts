import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Like } from './entities/like.entity';
import { UsersModule } from '../users/users.module';
import { NotifModule } from '../notif/notif.module';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Post, Like]), NotifModule],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
