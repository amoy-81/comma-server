import { HttpException, Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { UserModule } from '../user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatRoom, ChatRoomSchema } from './entities/chat-room.entity';
import { Chat, ChatSchema } from './entities/chat.entity';
import { ChatGateway } from './chat.gateway';
import { MulterModule } from '@nestjs/platform-express';
import { FileFilterCallback, diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';

const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback,
) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
    return callback(new HttpException('Only image files are allowed!', 422));
  }
  callback(null, true);
};

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: Chat.name, schema: ChatSchema },
    ]),
    UserModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/chat',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            file.fieldname + '-' + uniqueSuffix + extname(file.originalname),
          );
        },
      }),
      fileFilter: imageFileFilter,
    }),
  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
