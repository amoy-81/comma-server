// import {
//   OnGatewayConnection,
//   SubscribeMessage,
//   WebSocketGateway,
//   WebSocketServer,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { Chat } from './entities/chat.entity';
// import { RoomUser, SocketToClientChat } from './types/chat.type';
// import { ChatService } from './chat.service';
// import { SocketAuthMiddelware } from '../../common/middlewares/ws.middleware';
// import { Inject, forwardRef } from '@nestjs/common';

// @WebSocketGateway({ namespace: 'message' })
// export class ChatGateway implements OnGatewayConnection {
//   constructor(
//     // @Inject(forwardRef(() => ChatService))
//     // private readonly chatService: ChatService,
//   ) {}

//   // @WebSocketServer() io: Server<any, SocketToClientChat>;

//   // // Store user information with socketId as the key
//   // private users: {
//   //   [socketId: string]: RoomUser;
//   // } = {};

//   // // Method to get all users in a specified room
//   // private getRoomUsers(roomId: string) {
//   //   // Get all socket IDs
//   //   return (
//   //     Object.keys(this.users)
//   //       // Filter users by roomId
//   //       .filter((uid) => this.users[uid].roomId === roomId)
//   //       // Map the filtered socket IDs to user objects
//   //       .map((uid) => this.users[uid])
//   //   );
//   // }

//   // // Handle new client connections
//   // async handleConnection(client: Socket) {
//   //   try {
//   //     // Extract roomId and userId using a middleware
//   //     const [roomId, userId] = SocketAuthMiddelware(client);

//   //     // Add the user to the chat room using the chat service
//   //     const { name, email, avatar } = await this.chatService.wsJoinInRoom(
//   //       client,
//   //       roomId,
//   //       userId,
//   //     );

//   //     // Store the user's information and room in the users object
//   //     this.users[client.id] = { userId, roomId, name, email, avatar };

//   //     // Filter the users and return only those who are in the specified room
//   //     const roomUsers: Array<RoomUser> = this.getRoomUsers(roomId);

//   //     // Send a 'joinRoom' message to all users in the room with the new user's ID
//   //     client.broadcast.to(roomId).emit('joinRoom', this.users[client.id]);

//   //     // Send the list of users in the room to all users in the room
//   //     this.io.to(roomId).emit('onlineUsers', roomUsers);
//   //   } catch (error) {
//   //     client.disconnect();
//   //   }
//   // }

//   // async handleDisconnect(client: Socket) {
//   //   try {
//   //     // Retrieve the roomId from the users object using the client ID
//   //     const roomId = this.users[client.id]?.roomId;
//   //     const userId = this.users[client.id]?.userId;

//   //     // Delete the user from the list of current users in the database.
//   //     await this.chatService.wsLeavingRoom(
//   //       roomId.toString(),
//   //       userId.toString(),
//   //     );

//   //     // Remove the user from the users object
//   //     delete this.users[client.id];

//   //     // Get the list of users in the specified room
//   //     const roomUsers = this.getRoomUsers(roomId);

//   //     // Send the updated list of users to all clients in the room
//   //     this.io.to(roomId).emit('onlineUsers', roomUsers);
//   //   } catch (error) {
//   //     console.log(error);
//   //   }
//   // }

//   // // Send a new message to the room
//   // sendMessage(message: Chat) {
//   //   // Emit the 'newMessage' event to all clients in the room
//   //   this.io.to(message.roomId.toString()).emit('newMessage', message);
//   // }

//   // // Get user is typing signal.
//   // @SubscribeMessage('isTyping')
//   // isTypingHandler(client: Socket) {
//   //   // Get user datas from users list.
//   //   const user = this.users[client.id];
//   //   // Send istyping... signal for other users in room.
//   //   client.broadcast.to(user.roomId).emit('isTyping', user);
//   // }
// }
