import { ObjectType, Field } from '@nestjs/graphql';
import { Document, Schema as MongooSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@ObjectType()
@Schema({ timestamps: true })
export class User {
  @Field(() => String)
  _id: MongooSchema.Types.ObjectId;

  @Field(() => String)
  @Prop({ required: true })
  name: string;

  @Field(() => String)
  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ default: null })
  password: string;

  @Field(() => String, { nullable: true })
  @Prop({ default: null })
  avatar: string;

  @Field(() => Boolean)
  @Prop({ required: true, default: false })
  blueTick: boolean;

  @Field(() => String)
  @Prop({ default: 'User Of Comma' })
  bio: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
