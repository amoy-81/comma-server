import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AddUserToChatRoomDto {
  @IsNotEmpty()
  @IsString()
  chatRoomId: string;

  @IsArray()
  @IsString({ each: true })
  members: string[];
}
