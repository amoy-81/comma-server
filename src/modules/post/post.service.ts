import { HttpException, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PostMessage } from './messages/post.message';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { Like } from './entities/like.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postsRepository: Repository<Post>,
    @InjectRepository(Like) private readonly likeRepository: Repository<Like>,
  ) {}

  async createPost(createPostDto: CreatePostDto) {
    const post = new Post();
    post.user_id = 1;
    post.text_content = createPostDto.textContent;
    post.image_content = createPostDto.imageContent ?? null;
    return this.postsRepository.save(post);
  }

  async createLike(id: number) {
    const post = await this.postsRepository.findOne({ where: { id } });

    const like = new Like();

    like.post = post;

    like.user_id = 1;

    return this.likeRepository.save(like);
  }

  async getLike() {
    return this.likeRepository.find({ relations: { post: true } });
  }
}
