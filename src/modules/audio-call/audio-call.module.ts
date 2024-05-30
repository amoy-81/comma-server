import { Module } from '@nestjs/common';
import { AudioCallGateway } from './audio-call.gateway';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [ChatModule],
  providers: [AudioCallGateway],
})
export class AudioCallModule {}
