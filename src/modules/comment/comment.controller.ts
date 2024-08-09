import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentInput } from './dto/create-comment-input';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PaginationQueryDto } from '../post/dto/pagination-dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body() createCommentInput: CreateCommentInput) {
    return this.commentService.create(
      createCommentInput.text,
      req.user.id,
      createCommentInput.post_id,
    );
  }

  @Get('list/:id')
  getPostCommentList(
    @Param('id', ParseIntPipe) postId: number,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    const { page = 1, pageSize = 6 } = paginationQuery;
    return this.commentService.getPostComments(postId, page, pageSize);
  }
}
