import { Resolver, Query, Context, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Post } from './entities/post.entity';
import { PostService } from './post.service';
import { GetPostsInputs } from './dto/get-posts-inputs';
import { PaginationInput } from './dto/pagination-inputs';

@Resolver(() => Post)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @Query(() => [Post], { name: 'findPost' })
  @UseGuards(JwtAuthGuard)
  findPosts(@Args('getPostsInputs') getPostsInput: GetPostsInputs) {
    return this.postService.findPosts(getPostsInput);
  }

  @Query(() => [Post], { name: 'relatedPost' })
  @UseGuards(JwtAuthGuard)
  relatedPost(
    @Context() context,
    @Args('paginationInputs')
    paginationInputs: PaginationInput,
  ) {
    return this.postService.relatedPost(paginationInputs, context.req.user);
  }
}
