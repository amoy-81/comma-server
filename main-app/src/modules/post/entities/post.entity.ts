import { ObjectType, Field } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooSchema } from 'mongoose';
import { User } from '../../../modules/user/entities/user.entity';

@ObjectType()
@Schema({ timestamps: true })
export class Post {
  @Field(() => String)
  _id: MongooSchema.Types.ObjectId;

  @Field(() => String)
  @Prop({ required: true })
  body: string;

  @Field(() => String, { nullable: true })
  @Prop({ default: null })
  image: string;

  @Field(() => User)
  @Prop({ ref: User.name, required: true })
  author: MongooSchema.Types.ObjectId;

  @Field(() => [User])
  @Prop({ default: [], ref: User.name, required: true })
  likers: MongooSchema.Types.ObjectId[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

export type PostDocument = Post & Document;
export const PostSchema = SchemaFactory.createForClass(Post);
