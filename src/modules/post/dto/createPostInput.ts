import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreatePostInput {
  @IsNotEmpty()
  @IsString()
  text_content: string;
  image_content: string;
  user_id: number;
}
