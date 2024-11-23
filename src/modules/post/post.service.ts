import {
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PostMessage } from './messages/post.message';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { Like } from './entities/like.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class PostService {
  constructor(
    private readonly userService: UsersService,
    @InjectRepository(Post) private readonly postsRepository: Repository<Post>,
    @InjectRepository(Like) private readonly likeRepository: Repository<Like>,
  ) {}

  async createPost(createPostDto: CreatePostDto) {
    const user = await this.userService.findUserById(createPostDto.user_id);

    if (!user) throw new HttpException('user not found', HttpStatus.NOT_FOUND);

    const post = new Post();
    post.user = user;
    post.text_content = createPostDto.text_content;
    post.image_content = createPostDto.image_content ?? null;

    const result = await this.postsRepository.save(post);

    return { success: true, id: result.id, user_id: result.user.id };
  }

  async getRandomPosts(page: number, pageSize: number): Promise<Post[]> {
    return this.postsRepository
      .createQueryBuilder('posts')
      .leftJoinAndSelect('posts.user', 'user')
      .loadRelationCountAndMap('posts.likeCount', 'posts.like')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('posts.id')
          .from(Post, 'posts')
          .orderBy('RANDOM()')
          .skip((page - 1) * pageSize)
          .take(pageSize)
          .getQuery();
        return 'posts.id IN ' + subQuery;
      })
      .select([
        'posts.id',
        'posts.text_content',
        'posts.image_content',
        'posts.created_at',
        'posts.updated_at',
        'user.id',
        'user.name',
        'user.avatar',
        'user.email',
      ])
      .getMany();
  }

  async getUserPosts(
    loginUser: number,
    userId: number,
    page: number,
    pageSize: number,
  ): Promise<Post[]> {
    const postsList = await this.postsRepository
      .createQueryBuilder('posts')
      .where('posts.user_id = :userId', { userId })
      .leftJoinAndSelect('posts.user', 'user')
      .loadRelationCountAndMap('posts.likeCount', 'posts.like')
      .select([
        'posts.id',
        'posts.text_content',
        'posts.image_content',
        'posts.created_at',
        'posts.updated_at',
        'user.id',
        'user.name',
        'user.avatar',
        'user.email',
      ])
      .orderBy('posts.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return await this.addHasLikeInList(postsList, loginUser);
  }

  async getFollowingUserPosts(
    userId: number,
    page: number,
    pageSize: number,
  ): Promise<Post[]> {
    const { following } = await this.userService.getUserFollowDetails(userId);

    const followingUserIds = following.map((f) => f.id);

    followingUserIds.push(userId);

    const postsList = await this.postsRepository
      .createQueryBuilder('posts')
      .where('posts.user_id IN (:...followingUserIds)', { followingUserIds })
      .leftJoinAndSelect('posts.user', 'user')
      .loadRelationCountAndMap('posts.likeCount', 'posts.like')
      .select([
        'posts.id',
        'posts.text_content',
        'posts.image_content',
        'posts.created_at',
        'posts.updated_at',
        'user.id',
        'user.name',
        'user.avatar',
        'user.email',
      ])
      .orderBy('posts.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return await this.addHasLikeInList(postsList, userId);
  }

  async addHasLikeInList(postsList: Post[], userId: number) {
    const postIds = postsList.map((post) => post.id);

    const userLikes = await this.likeRepository.find({
      where: {
        postId: In(postIds),
        user_id: userId,
      },
    });

    postsList.forEach((post) => {
      post.hasLike = !!userLikes.find((like) => like.postId === post.id);
    });

    return postsList;
  }

  getOnePostById(id: number) {
    return this.postsRepository
      .createQueryBuilder('posts')
      .where('posts.id = :id', { id })
      .leftJoinAndSelect('posts.user', 'user')
      .loadRelationCountAndMap('posts.likeCount', 'posts.like')
      .select([
        'posts.id',
        'posts.text_content',
        'posts.image_content',
        'posts.created_at',
        'posts.updated_at',
        'user.id',
        'user.name',
        'user.avatar',
        'user.email',
      ])
      .getOne();
  }

  async toggleLike(postId: number, userId: number) {
    const post = await this.postsRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new HttpException(PostMessage, HttpStatus.NOT_FOUND);
    }

    const existingLike = await this.likeRepository.findOne({
      where: { postId, user_id: userId },
    });

    if (existingLike) {
      // If the user has already liked the post, remove the like (dislike)
      await this.likeRepository.delete(existingLike.id);
      return { message: PostMessage.successUnlike, op: 'DISLIKE' };
    } else {
      // If the user has not liked the post yet, create a new like
      const like = new Like();
      like.post = post;
      like.user_id = userId;

      await this.likeRepository.save(like);
      return { message: PostMessage.successLike, op: 'LIKE' };
    }
  }

  async getPostLikes(postId: number, page: number, pageSize: number) {
    const [likes, count] = await this.likeRepository
      .createQueryBuilder('likes')
      .where('likes.post_id = :postId', { postId })
      .leftJoinAndSelect('likes.user', 'user')
      .leftJoinAndSelect('likes.post', 'post')
      .select([
        'likes.id',
        'likes.createdAt',
        'post.id',
        'post.created_at',
        'user.id',
        'user.name',
        'user.email',
        'user.avatar',
      ])
      .orderBy('likes.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      post_id: postId,
      total: count,
      page,
      pageSize,
      users: likes.map((like) => like.user),
    };
  }

  async deletePost(userId: number, postId: number) {
    const result = await this.postsRepository
      .createQueryBuilder()
      .delete()
      .from(Post)
      .where('id = :postId AND user_id = :userId', {
        postId,
        userId,
      })
      .execute();

    if (result && result.affected) {
      return { message: 'post delete success', op: 'DELETE' };
    } else {
      throw new HttpException('post is not valid', HttpStatus.BAD_REQUEST);
    }
  }

  async searchPostByText(text: string, page: number, limit: number) {
    const offset = (page - 1) * limit;

    const result = await this.postsRepository
      .createQueryBuilder('post')
      .where('post.text_content LIKE :text', { text: `%${text}%` })
      .skip(offset)
      .take(limit)
      .getMany();

    return result;
  }
}
