import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Put,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { DeleteFromRoomDto } from './dto/delete-from-room.dto';
import { MessageDto } from './dto/message.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('new-message')
  createNewMessage(@Req() req: any, @Body() inputs: MessageDto) {
    inputs.author = req.user.id;
    return this.chatService.createMessage(inputs);
  }

  @Get('prev-messages/:roomId')
  getAllPrevMessage(@Req() req: any, @Param('roomId') roomId: string) {
    const { page, size } = req.query;
    return this.chatService.getPrevMessages(roomId, req.user.id, {
      page: parseInt(page),
      size: parseInt(size),
    });
  }

  @Delete('message/:messgaeId')
  deleteMessage(@Req() req: any, @Param('messgaeId') messageId: string) {
    return this.chatService.deleteMessage(messageId, req.user.id);
  }

  /**
   * Room Options
   */

  @Post('chat-room')
  @UseInterceptors(FileInterceptor('avatar'))
  createChatRoom(
    @Req() req: any,
    @Body() inputs: CreateChatRoomDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Save file in storage and add path to inputs.
    inputs.avatar = file ? file.path : null;
    // Create new chatroom and return res.
    return this.chatService.createChatRoom(inputs, req.user.id);
  }

  @Get('invite-link/:roomId')
  addUserToRoom(@Req() req: any, @Param('roomId') roomId: string) {
    return this.chatService.generateInviteLink(roomId, req.user.id);
  }

  @Put('join/:inviteLink')
  joinInRoom(@Req() req: any, @Param('inviteLink') inviteLink: string) {
    return this.chatService.joinToRoomWithLink(inviteLink, req.user.id);
  }

  @Put('delete-user')
  deleteUserFromRoom(@Req() req: any, @Body() inputs: DeleteFromRoomDto) {
    const { chatRoomId, userId } = inputs;
    return this.chatService.deleteUserFromRoom(chatRoomId, userId, req.user.id);
  }

  @Delete('room/:roomId')
  deleteRoom(@Req() req: any, @Param('roomId') roomId: string) {
    return this.chatService.deleteRoom(roomId, req.user.id);
  }

  @Get('my-rooms')
  getAllRooms(@Req() req: any) {
    return this.chatService.getUserRooms(req.user.id);
  }

  @Get('room/:roomId')
  getOneRoom(@Req() req: any, @Param('roomId') roomId: string) {
    return this.chatService.oneRoom(roomId, req.user.id);
  }
}
