import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetCommentInput } from './dto/get-comment.input';
import { CreateCommentInput } from './dto/create-comment.input';

@Resolver(() => Comment)
export class CommentResolver {
  constructor(private readonly commentService: CommentService) {}

  @Query(() => [Comment], { name: 'getPostComments' })
  @UseGuards(JwtAuthGuard)
  getPostComments(@Args('input') input: GetCommentInput) {
    const { postId, page, pageSize } = input;
    return this.commentService.getPostComments(postId, page, pageSize);
  }

  @Mutation(() => Comment, { name: 'createComment' })
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Context() context,
    @Args('input') input: CreateCommentInput,
  ) {
    return this.commentService.create(input, context.req.user);
  }

  @Mutation(() => String, { name: 'voteComment' })
  @UseGuards(JwtAuthGuard)
  async vote(
    @Context() context,
    @Args('commentId', { type: () => String }) commentId: string,
  ) {
    return this.commentService.voteUpOperation(commentId, context.req.user);
  }
}
