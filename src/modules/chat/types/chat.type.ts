import { Chat } from '../entities/chat.entity';

export type RoomUser = {
  userId: string;
  roomId: string;
  name: string;
  email: string;
  avatar: string;
};

export interface SocketToClientChat {
  newMessage: (payload: Chat) => void;
  onlineUsers: (payload: Array<RoomUser>) => void;
}
