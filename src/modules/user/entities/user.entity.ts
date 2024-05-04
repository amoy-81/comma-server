import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { Document, Schema as MongooSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum RoleItems {
  NORMAL_USER = 'NORMAL_USER',
  GOLD_USER = 'GOLD_USER',
  VERIFYED_USER = 'VERIFYED_USER',
  SUPER_USER = 'SUPER_USER',
}
registerEnumType(RoleItems, { name: 'roles' });

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

  @Field(() => RoleItems, {
    nullable: true,
    defaultValue: RoleItems.NORMAL_USER,
  })
  @Prop({ required: true, default: RoleItems.NORMAL_USER })
  role: RoleItems;

  @Field(() => String)
  @Prop({ default: 'User Of Comma' })
  bio: string;

  @Field(() => [User])
  @Prop({ required: true, default: [], ref: User.name })
  followers: MongooSchema.Types.ObjectId[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
