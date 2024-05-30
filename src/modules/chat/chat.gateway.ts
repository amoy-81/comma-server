import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Chat } from './entities/chat.entity';
import { SocketToClientChat } from './types/chat.type';
import { ChatService } from './chat.service';
import { SocketAuthMiddelware } from '../../common/middlewares/ws.middleware';
import { Inject, forwardRef } from '@nestjs/common';

@WebSocketGateway({ namespace: 'message' })
export class ChatGateway implements OnGatewayConnection {
  constructor(
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
  ) {}

  @WebSocketServer() io: Server<any, SocketToClientChat>;

  // Handle new client connections
  async handleConnection(client: Socket, ...args: any[]) {
    try {
      // Extract the roomId and userId from the client using SocketAuthMiddelware
      const [roomId, userId] = SocketAuthMiddelware(client);

      // Join the client in the room using the chatService
      await this.chatService.wsJoinInRoom(client, roomId, userId);
    } catch (error) {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket, ...args: any[]) {
    // Extract the roomId and userId from the client.
    const roomId = client.handshake.headers['set-room-id'];
    const userId = client.handshake.headers['set-user-id'];

    // Delete the user from the list of current users in the database.
    await this.chatService.wsLeavingRoom(roomId.toString(), userId.toString());
  }

  // Send a new message to the room
  sendMessage(message: Chat) {
    // Emit the 'newMessage' event to all clients in the room
    this.io.to(message.roomId.toString()).emit('newMessage', message);
  }
}
