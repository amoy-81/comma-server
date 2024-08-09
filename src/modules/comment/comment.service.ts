import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CommentMessage } from './messages/comment.message';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PostService } from '../post/post.service';
import { Comment } from './entities/comment.entity';
import { Vote } from './entities/vote.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Vote)
    private readonly voteRepository: Repository<Vote>,
    private readonly postService: PostService,
  ) {}
  async create(text: string, userId: number, postId: number) {
    const post = await this.postService.getOnePostById(postId);

    if (!post)
      throw new HttpException('Post is not found', HttpStatus.NOT_FOUND);

    const newComment = new Comment();
    newComment.text = text;
    newComment.userId = userId;
    newComment.postId = post.id;

    return await this.commentRepository.save(newComment);
  }

  async getPostComments(
    postId: number,
    userId: number | null,
    page: number,
    pageSize: number,
  ) {
    const commentsLog = await this.commentRepository
      .createQueryBuilder('comments')
      .where('comments.post_id = :postId', { postId })
      .leftJoinAndSelect('comments.user', 'user')
      .loadRelationCountAndMap('comments.voteCount', 'comments.votes')
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

    if (!userId) return commentsLog;

    const commentIds = commentsLog.map((comment) => comment.id);

    const userVotes = await this.voteRepository.find({
      where: {
        commentId: In(commentIds),
        userId: userId,
      },
    });

    commentsLog.forEach((comment) => {
      comment.hasVoted = !!userVotes.find(
        (vote) => vote.commentId === comment.id,
      );
    });

    return commentsLog;
  }

  async toggleVote(userId: number, commentId: number) {
    const existingVote = await this.voteRepository.findOne({
      where: { commentId, userId },
    });

    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment)
      throw new HttpException(CommentMessage.notFound, HttpStatus.NOT_FOUND);

    if (existingVote) {
      await this.voteRepository.delete(existingVote.id);
      return { message: CommentMessage.successVoteDown, op: 'VOTE_DOWN' };
    } else {
      const newVote = new Vote();
      newVote.userId = userId;
      newVote.commentId = commentId;

      await this.voteRepository.save(newVote);
      return { message: CommentMessage.successVoteUp, op: 'VOTE_UP' };
    }
  }
}
