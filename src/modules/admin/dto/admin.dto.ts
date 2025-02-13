import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AddForbiddenWordsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  words: string[];
}

export class CheckForbiddenWordsDto {
  @IsString({ each: true })
  @IsNotEmpty()
  sentence: string;
}
