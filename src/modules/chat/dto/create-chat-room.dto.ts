import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateChatRoomDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsArray()
  @IsString({ each: true })
  members: string[];
}
