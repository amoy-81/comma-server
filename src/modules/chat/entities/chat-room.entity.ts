import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooSchema } from 'mongoose';
import { User } from '../../user/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class ChatRoom {
  @Prop({ required: true })
  name: string;

  @Prop({ default: null })
  avatar: string;

  @Prop({ ref: User.name, required: true })
  owner: MongooSchema.Types.ObjectId;

  @Prop({ default: [], ref: User.name, required: true })
  admins: MongooSchema.Types.ObjectId[];

  @Prop({ default: [], ref: User.name, required: true })
  members: MongooSchema.Types.ObjectId[];

  @Prop({ default: [], ref: User.name, required: true })
  currentlyUsers: MongooSchema.Types.ObjectId[];

  @Prop({ required: true, default: uuidv4, unique: true })
  inviteLink: string;
}

export type ChatRoomDocument = ChatRoom & Document;
export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
