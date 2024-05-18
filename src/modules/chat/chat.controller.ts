import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Put,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('chat-room')
  createChatRoom(@Req() req: any, @Body() inputs: CreateChatRoomDto) {
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
}
