import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { UserModule } from '../user/user.module';
import { PostController } from './post.controller';
import { Post, PostSchema } from './entities/post.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { PostResolver } from './post.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    UserModule,
  ],
  controllers: [PostController],
  providers: [PostResolver, PostService],
  exports: [PostService],
})
export class PostModule {}
