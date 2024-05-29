import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MessageDto {
  @IsNotEmpty()
  @IsString()
  body: string;

  @IsNotEmpty()
  @IsString()
  roomId: string;

  author: string;

  @IsArray()
  @IsOptional()
  files: string[];
}
