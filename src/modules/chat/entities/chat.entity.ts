import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooSchema } from 'mongoose';
import { User } from '../../user/entities/user.entity';
import { ChatRoom } from './chat-room.entity';

@Schema({ timestamps: true })
export class Chat {
  @Prop({ ref: User.name, required: true })
  author: MongooSchema.Types.ObjectId;

  @Prop({ ref: ChatRoom.name, required: true })
  roomId: MongooSchema.Types.ObjectId;

  @Prop({ required: true })
  body: string;

  @Prop({ default: [], required: true })
  files: string[];
}

export type ChatDocument = Chat & Document;
export const ChatSchema = SchemaFactory.createForClass(Chat);
