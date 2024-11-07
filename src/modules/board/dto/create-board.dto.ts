import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBoardDto {
  userId: number;

  @IsNotEmpty()
  @IsString()
  text: string;
}
