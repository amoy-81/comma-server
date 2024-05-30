import { Chat } from '../entities/chat.entity';

export interface SocketToClientChat {
  newMessage: (payload: Chat) => void;
}
