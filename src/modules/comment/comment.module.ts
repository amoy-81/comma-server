import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { PostModule } from '../post/post.module';
import { Comment } from './entities/comment.entity';
import { Vote } from './entities/vote.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentController } from './comment.controller';
import { NotifModule } from '../notif/notif.module';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Vote]), PostModule, NotifModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
