import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateChatRoomDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsArray()
  @IsString({ each: true })
  members: string[];

  @IsOptional()
  @Type(() => String)
  @IsIn(['image/png', 'image/jpeg', 'image/jpg'], {
    message: 'Avatar must be a file of type: png, jpeg, jpg',
  })
  avatar: string | null;
}
