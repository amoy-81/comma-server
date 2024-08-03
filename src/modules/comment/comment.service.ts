import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from './entities/comment.entity';
import { Model, Schema as MongooseSchema } from 'mongoose';
import { User } from '../user/entities/user.entity';
import { CreateCommentInput } from './dto/create-comment.input';
import { CommentMessage } from './messages/comment.message';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
  ) {}

  /**
   * Create new comment for posts
   */
  async create(
    createCommentInput: CreateCommentInput,
    user: User,
  ): Promise<Comment> {
    // Create a new comment using the provided input data and the user's ID.
    const newComment = await this.commentModel.create({
      ...createCommentInput,
      author: user._id,
    });

    // Populate author, voteUp, post in model.
    await newComment.populate({
      path: 'author voteUp postId',
      populate: {
        strictPopulate: false,
        path: 'following likers author',
        populate: { strictPopulate: false, path: 'following likers author' },
      },
    });

    // Return the newly created comment.
    return newComment;
  }

  async getPostComments(
    postId: string,
    page: number,
    pageSize: number,
  ): Promise<Comment[]> {
    // Find all comments for the given post ID.
    const comments = await this.commentModel
      .find({ postId })
      .sort({ voteUp: -1 })
      .skip(page ? pageSize * page - pageSize : 0)
      .limit(page ? pageSize : 0)
      .populate({
        path: 'author voteUp postId',
        populate: {
          strictPopulate: false,
          path: 'following likers author',
          populate: { strictPopulate: false, path: 'following likers author' },
        },
      });

    // Return the retrieved comments.
    return comments;
  }

  async voteUpOperation(commentId: string, user: User): Promise<string> {
    try {
      // Find the comment with the given ID.
      const comment = await this.commentModel.findById(commentId);

      // Function for save comment changes.
      const saveModel: () => Promise<void> = async () => {
        await comment.save();
      };

      // Check the comment exists. Throw an error if the comment does not exist.
      if (!comment) throw new HttpException(CommentMessage.notFound, 404);

      if (comment.voteUp.includes(user._id)) {
        // If the user has already voteUp the comment, remove them from the voteUp array.
        return this.voteDown(comment, user._id, saveModel);
      } else {
        // If the user has not voteUp the comment, add them to the voteUp array.
        return this.voteUp(comment, user._id, saveModel);
      }
    } catch (error) {
      // Throw an error if the comment does not exist.
      throw new HttpException(CommentMessage.notFound, 404);
    }
  }

  private async voteUp(
    comment: Comment,
    userId: MongooseSchema.Types.ObjectId,
    saveModel: () => Promise<void>,
  ): Promise<string> {
    // Add the user's ID to the comment's voteUp array.
    comment.voteUp.push(userId);
    // Save the updated comment.
    await saveModel();

    // Return a success response with the updated comment's ID and a success message.
    return CommentMessage.successVoteUp;
  }

  private async voteDown(
    comment: Comment,
    userId: MongooseSchema.Types.ObjectId,
    saveModel: () => Promise<void>,
  ): Promise<string> {
    // Remove the user's ID from the comment's voteUp array.
    const newVoteUpArray: MongooseSchema.Types.ObjectId[] =
      comment.voteUp.filter((id) => id.toString() !== userId.toString());
    // Insert the new value in the list of Vote
    comment.voteUp = newVoteUpArray;
    // Save the updated comment.
    await saveModel();

    // Return a success response with the updated comment's ID and a success message.
    return CommentMessage.successVoteDown;
  }
}
