import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreatePostDto {
  user_id: number;
  text_content: string;
  image_content: string;
}
