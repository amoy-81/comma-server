import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCommentInput {
  @IsNotEmpty()
  @IsNumber()
  post_id: number;

  @IsNotEmpty()
  @IsString()
  text: string;
}
