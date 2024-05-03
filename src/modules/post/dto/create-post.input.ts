import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreatePostInput {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  body: string;

  image: string;
}
