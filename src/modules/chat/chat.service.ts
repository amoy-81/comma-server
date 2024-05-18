import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ChatRoom, ChatRoomDocument } from './entities/chat-room.entity';
import { Model } from 'mongoose';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { ChatRoomMessage } from './messages/chat-room.message';
import { UserService } from '../user/user.service';
import { AddUserToChatRoom } from './types/add-user-to-room';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatRoom.name)
    private readonly chatRoomModel: Model<ChatRoomDocument>,
    private readonly userService: UserService,
  ) {}
  async createChatRoom(input: CreateChatRoomDto, ownerId: string) {
    try {
      // Create a new chat room using the provided input data and owner ID.
      const newChatRoom = await this.chatRoomModel.create({
        name: input.name,
        owner: ownerId,
        members: [ownerId],
      });

      // Return a success response with the new chat room's ID, message, and success indicator.
      return {
        chatRoomId: newChatRoom._id,
        message: ChatRoomMessage.successCreate,
        success: true,
      };
    } catch (error) {
      // Throw an error if the chat room creation fails.
      throw new HttpException(error.message || 'Opps...', 400);
    }
  }

  async generateInviteLink(roomId: string, userId: string) {
    try {
      // Find the chat room with the provided ID.
      const chatRoom = await this.chatRoomModel.findById(roomId);
      // Check if the chat room exists.
      if (!chatRoom) throw new HttpException(ChatRoomMessage.notFound, 404);

      // Check if the user is the owner of the chat room.
      if (chatRoom.owner.toString() !== userId)
        throw new HttpException(ChatRoomMessage.notFound, 400);

      // Generate a new invite link.
      const newLink = uuidv4();
      // Set the invite link for the chat room.
      chatRoom.inviteLink = newLink;

      // Save the updated chat room.
      await chatRoom.save();
      // Return a success response with the new invite.
      return {
        uuid: newLink,
        success: true,
      };
    } catch (error) {
      // Throw an error if the invite link generation fails.
      throw new HttpException(error.message || ChatRoomMessage.notFound, 404);
    }
  }

  /**
   * Add a user to a chat room using the provided invite link.
   *
   * @param inviteLink - The invite link for the chat room.
   * @param userId - The ID of the user to add to the chat room.
   *
   * @returns The result of adding the user to the chat room.
   *
   * @throws {HttpException} If the chat room is not found (404).
   */
  async joinToRoomWithLink(inviteLink: string, userId: string) {
    try {
      // Find the chat room with the provided invite link.
      const room = await this.chatRoomModel.findOne({ inviteLink });

      // Check if the chat room exists.
      if (!room) throw new HttpException(ChatRoomMessage.notFound, 404);

      // Add the user to the chat room.
      const result = await this.addUserToChatRoom(room.id, [userId]);

      // Check if the user was successfully added to the chat room.
      if (!result.success) throw new HttpException(result.message, 400);

      // Return the result of adding the user to the chat room.
      return result;
    } catch (error: any) {
      // Throw an error if the adding fails.
      throw new HttpException(error.message || ChatRoomMessage.notFound, 404);
    }
  }

  async addUserToChatRoom(
    chatRoomId: string,
    users: string[],
  ): Promise<AddUserToChatRoom> {
    let countOfOpration = 0;
    try {
      // Find the chat room with the provided ID.
      const chatRoom = await this.chatRoomModel.findById(chatRoomId);
      // Check if the chat room exists.
      if (!chatRoom) throw new HttpException(ChatRoomMessage.notFound, 404);

      // Iterate over the list of users to add to the chat room.
      for (const userId of users) {
        try {
          // Find the user with the provided ID.
          const checkdUser = await this.userService.findById(userId);
          // Check if the user exists.
          if (checkdUser) {
            // Check if the user is not already a member of the chat room.
            if (!chatRoom.members.includes(checkdUser._id)) {
              // Add the user to the chat room's members array.
              chatRoom.members.push(checkdUser._id);
              // Increment the operation count.
              countOfOpration += 1;
            }
          }
        } catch (error: any) {
          // Continue to the next user if an error occurs.
          continue;
        }
      }
      // Save the updated chat room.
      await chatRoom.save();

      // Return a success response with the chat room ID.
      return {
        chatRoomId: chatRoom._id,
        message: countOfOpration
          ? ChatRoomMessage.successUsersAdd
          : ChatRoomMessage.notAdded,
        countOfOpration,
        success: true,
      };
    } catch (error) {
      // Return an error response with the error message.
      return {
        message: error.message,
        countOfOpration,
        success: false,
      };
    }
  }
}
