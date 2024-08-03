import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreatePostDto {
  user_id: number;
  textContent: string;
  imageContent: string;
}
