import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class MessageDto {
  @IsNotEmpty()
  @IsString()
  body: string;

  @IsNotEmpty()
  // @IsNumber()
  roomId: number;

  author: number;

  @IsArray()
  @IsOptional()
  files: string[];
}
