import { ObjectType, Field } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooSchema } from 'mongoose';
import { User } from '../../user/entities/user.entity';
import { Post } from '../../../modules/post/entities/post.entity';

@ObjectType()
@Schema({ timestamps: true })
export class Comment {
  @Field(() => String)
  _id: MongooSchema.Types.ObjectId;

  @Field(() => Post)
  @Prop({ required: true, ref: Post.name })
  postId: MongooSchema.Types.ObjectId;

  @Field(() => String)
  @Prop({ required: true })
  body: string;

  @Field(() => User)
  @Prop({ ref: User.name, required: true })
  author: MongooSchema.Types.ObjectId;

  @Field(() => [User])
  @Prop({ ref: User.name, default: [], required: true })
  voteUp: MongooSchema.Types.ObjectId[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

export type CommentDocument = Comment & Document;
export const CommentSchema = SchemaFactory.createForClass(Comment);
