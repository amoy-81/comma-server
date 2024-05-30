import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketAuthMiddelware } from 'src/common/middlewares/ws.middleware';
import { ChatService } from '../chat/chat.service';
import { Inject, forwardRef } from '@nestjs/common';

@WebSocketGateway({ namespace: 'audio-call', cors: '*' })
export class AudioCallGateway {
  constructor(
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
  ) {}

  // Socket io Server
  @WebSocketServer() server: Server;

  // Store user information with socketId as the key
  private users: { [socketId: string]: { userId: string; roomId: string } } =
    {};

  // Method to get all users in a specified room
  private getRoomUsers(roomId: string) {
    // Get all socket IDs
    return (
      Object.keys(this.users)
        // Filter users by roomId
        .filter((uid) => this.users[uid].roomId === roomId)
        // Map the filtered socket IDs to user objects
        .map((uid) => this.users[uid])
    );
  }

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  async handleConnection(client: Socket) {
    try {
      // Extract roomId and userId using a middleware
      const [roomId, userId] = SocketAuthMiddelware(client);

      // Add the user to the chat room using the chat service
      await this.chatService.wsJoinInRoom(client, roomId, userId);

      // Store the user's information and room in the users object
      this.users[client.id] = { userId, roomId };

      // Filter the users and return only those who are in the specified room
      const roomUsers = this.getRoomUsers(roomId);

      // Send a 'joinRoom' message to all users in the room with the new user's ID
      this.server.to(roomId).emit('joinRoom', userId);

      // Send the list of users in the room to all users in the room
      this.server.to(roomId).emit('users', roomUsers);
    } catch (err) {
      // Disconnect the client if an error occurs
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    try {
      // Retrieve the roomId from the users object using the client ID
      const roomId = this.users[client.id]?.roomId;

      // Remove the user from the users object
      delete this.users[client.id];

      // Get the list of users in the specified room
      const roomUsers = this.getRoomUsers(roomId);

      // Send the updated list of users to all clients in the room
      this.server.to(roomId).emit('users', roomUsers);
    } catch (error) {
      // Log any errors that occur
      console.log(error || 'Err');
    }
  }

  @SubscribeMessage('signal')
  handleSignal(client: Socket, payload: { roomId: string; signal: any }): void {
    // Retrieve the user information from the users object using the client ID
    const user = this.users[client.id];

    // Check if the user exists and is in the specified room
    if (user && user.roomId === payload.roomId) {
      // Broadcast the signal to all clients in the room except the sender
      client.broadcast
        .to(payload.roomId)
        .emit('signal', { from: user.userId, signal: payload.signal });
    }
  }
}
