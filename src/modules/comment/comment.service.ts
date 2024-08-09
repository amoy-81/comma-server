import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CommentMessage } from './messages/comment.message';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostService } from '../post/post.service';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly postService: PostService,
  ) {}
  async create(text: string, userId: number, postId: number) {
    const post = await this.postService.getOnePostById(postId);

    if (!post)
      throw new HttpException(CommentMessage.notFound, HttpStatus.NOT_FOUND);

    const newComment = new Comment();
    newComment.text = text;
    newComment.userId = userId;
    newComment.postId = post.id;

    return await this.commentRepository.save(newComment);
  }

  async getPostComments(postId: number, page: number, pageSize: number) {
    return this.commentRepository
      .createQueryBuilder('comments')
      .where('comments.post_id = :postId', { postId })
      .leftJoinAndSelect('comments.user', 'user')
      .select([
        'comments.id',
        'comments.text',
        'comments.postId',
        'comments.created_at',
        'comments.updated_at',
        'user.id',
        'user.name',
        'user.email',
        'user.avatar',
      ])
      .orderBy('comments.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
  }
}
