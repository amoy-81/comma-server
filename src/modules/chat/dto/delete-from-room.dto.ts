import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteFromRoomDto {
  @IsNotEmpty()
  @IsString()
  chatRoomId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;
}
