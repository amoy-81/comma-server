import { Injectable } from '@nestjs/common';
import { CreatePostInput } from './dto/create-post.input';
import { Post, PostDocument } from './entities/post.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PostMessage } from './messages/post.message';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}
  async create(createPostInput: CreatePostInput, userData: any) {
    const newPost = await this.postModel.create({
      ...createPostInput,
      author: userData.id,
    });

    return {
      success: true,
      postId: newPost._id,
      message: PostMessage.successCreate,
    };
  }

  findAll() {
    return this.postModel.find().populate({ path: 'author' });
  }
}
