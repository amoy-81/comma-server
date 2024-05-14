import { Injectable } from '@nestjs/common';
import { CreatePostInput } from './dto/create-post.input';
import { Post, PostDocument } from './entities/post.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PostMessage } from './messages/post.message';
import { GetPostsInputs } from './dto/get-posts-inputs';
import { User } from '../user/entities/user.entity';
import { PaginationInput } from './dto/pagination-inputs';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  /**
   * Create New Post
   */
  async create(createPostInput: CreatePostInput, userData: any) {
    // Create a new post using the provided input data and the user's ID
    const newPost = await this.postModel.create({
      // Spread the createPostInput object to include all its properties
      ...createPostInput,
      // Set the author of the post to the current user's ID
      author: userData.id,
    });

    // Return a success response with the new post's ID and a success message
    return {
      success: true,
      postId: newPost._id,
      message: PostMessage.successCreate,
    };
  }

  /**
   * Explore And Search in Posts
   * If a user ID is entered, it will return its posts
   * Otherwise, all posts will be considered for return
   */
  async findPosts(getPostsInput: GetPostsInputs) {
    // Check if a user ID is provided and it's not empty
    // And no search text is provided
    const onlyUserSearch =
      getPostsInput.userId &&
      getPostsInput.userId.length &&
      !getPostsInput.searchText;

    // No user ID is provided and search text is provided
    const onlyTextSearch = !getPostsInput.userId && getPostsInput.searchText;

    // User ID is provided and it's not empty and search text is also provided
    const userAndTextSearch =
      getPostsInput.userId &&
      getPostsInput.userId.length &&
      getPostsInput.searchText;

    // Construct the query object based on the search criteria
    const posts = await this.getPostsAsPagination(
      // If searching for a specific user's posts
      onlyUserSearch
        ? { author: getPostsInput.userId }
        : // If searching for posts of a specific user containing specific text
          onlyTextSearch
          ? { body: { $regex: getPostsInput.searchText.toLowerCase() } }
          : // If searching for posts of a specific user containing specific text
            userAndTextSearch
            ? {
                author: getPostsInput.userId,
                body: { $regex: getPostsInput.searchText.toLowerCase() },
              }
            : // No search criteria, return all posts
              {},
      getPostsInput.page,
      getPostsInput.pageSize,
    );
    // Return the retrieved posts
    return posts;
  }

  async relatedPost(getPostsInput: PaginationInput, userData: User) {
    // Returning all the posts of those the user follows
    const posts = await this.getPostsAsPagination(
      { author: { $in: userData.following } },
      getPostsInput.page,
      getPostsInput.pageSize,
    );

    return posts;
  }

  /**
   * Retrieves posts as pagination based on the provided query, page, and page size.
   */
  async getPostsAsPagination(query: any, page: number, pageSize: number) {
    // Find posts matching the query, excluding the __v field.
    // Sort the results in descending order based on the createdAt timestamp.
    const posts = await this.postModel
      .find(query, {
        __v: 0,
      })
      .sort({ createdAt: -1 }) // Skip posts based on the page number and page size.
      .skip(page ? pageSize * page - pageSize : 0) // Skip posts based on the page number and page size.
      .limit(page ? pageSize : 0) // Populate the author field for each post.
      .populate('author');

    // Return the retrieved posts.
    return posts;
  }
}
