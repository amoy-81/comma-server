import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { NewsPaperSectionType } from '../entities/news-paper-section.entity';

export class CreateNewsPaperSectionDto {
  @IsNotEmpty()
  newsPaperId: number;
  
  @IsEnum(NewsPaperSectionType)
  type: NewsPaperSectionType;
  
  @IsArray()
  @IsString({ each: true })
  title: string[];
  
  image: string;
  
  @IsArray()
  @IsString({ each: true })
  paragraph: string[];
  
  @IsNotEmpty()
  order: number;
}
