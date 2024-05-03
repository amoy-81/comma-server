import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Post } from './entities/post.entity';
import { PostService } from './post.service';

@Resolver(() => Post)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  // TODO : this method only for test
  @Query(() => [Post], { name: 'post' })
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.postService.findAll();
  }
}
