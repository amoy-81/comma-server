import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ChatRoom, ChatRoomDocument } from './entities/chat-room.entity';
import { Model, Schema as MongooseSchema } from 'mongoose';
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

  async getUserRooms(userId: string) {
    // Find rooms that the user is a owner of or a member of.
    const rooms = await this.chatRoomModel.find(
      { $or: [{ owner: userId }, { members: userId }] },
      { inviteLink: 0, __v: 0 },
    );
    // Return fined Rooms
    return rooms;
  }

  /**
   * Retrieves a chat room based on the roomId and userId.
   */
  async oneRoom(roomId: string, userId: string) {
    // Find the room based on roomId
    const room = await this.chatRoomModel.findById(roomId);
    // Remove the inviteLink field from the room data
    const { inviteLink, ...roomWithoutInviteLink } = room.toJSON();

    // Check if the owner is the same as the input userId
    // Return the entire room data if owner matches userId
    // Return room data without inviteLink if owner does not match userId
    return room.owner.toString() === userId.toString()
      ? room
      : roomWithoutInviteLink;
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

  async deleteUserFromRoom(
    roomId: string,
    selectedUserId: string,
    ownerId: string,
  ): Promise<{ message: string; success: boolean }> {
    try {
      // Find the chat room with the provided ID.
      const room = await this.chatRoomModel.findById(roomId);

      // Find the index of the user to delete in the members array.
      const userIndex: number = room.members.findIndex(
        (user) => user.toString() === selectedUserId.toString(),
      );

      // Check if the room exists, the owner ID matches, and the user to delete is a member.
      if (!room || room.owner.toString() !== ownerId || userIndex === -1)
        throw new HttpException(ChatRoomMessage.notFound, 404);

      // Create a new members array without the user to delete.
      const newMembersArray: MongooseSchema.Types.ObjectId[] =
        room.members.filter(
          (id) => id.toString() !== selectedUserId.toString(),
        );

      // Update the room's members array with the new array.
      room.members = newMembersArray;

      // Save the updated room.
      await room.save();

      // Return a success response.
      return {
        message: ChatRoomMessage.successDelete,
        success: true,
      };
    } catch (error) {
      // Throw an HTTP exception with the error message.
      throw new HttpException(error.message || ChatRoomMessage.notFound, 400);
    }
  }

  async deleteRoom(
    roomId: string,
    userId: string,
  ): Promise<{ message: string; success: boolean }> {
    try {
      // Find the chat room with the provided ID.
      const room = await this.chatRoomModel.findById(roomId);

      // Check if the chat room exists and user is the owner of the chat room.
      if (!room || room.owner.toString() !== userId.toString())
        throw new HttpException(ChatRoomMessage.notFound, 404);

      // Delete the chat room.
      await room.deleteOne();

      // Return a success response with success indicator.
      return {
        message: ChatRoomMessage.successDelete,
        success: true,
      };
    } catch (error) {
      // Throw an HTTP exception with the error message.
      throw new HttpException(error.message || ChatRoomMessage.notFound, 404);
    }
  }
}
