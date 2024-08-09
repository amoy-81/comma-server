import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { PostModule } from '../post/post.module';
import { Comment } from './entities/comment.entity';
import { Vote } from './entities/vote.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { CommentController } from './comment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Vote]), PostModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
