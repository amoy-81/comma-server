// import { PartialType } from '@nestjs/mapped-types';

import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { NewsPaperSectionType } from '../entities/news-paper-section.entity';

export class UpdateNewsPaperSectionDto {
  @IsOptional()
  @IsEnum(NewsPaperSectionType, {
    message: 'Invalid section type',
  })
  type?: NewsPaperSectionType;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'Title must contain at least one item' })
  @IsString({ each: true })
  title?: string[];

  image?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'Paragraph must contain at least one item' })
  @IsString({ each: true })
  paragraph?: string[];

  @IsOptional()
  // @IsNumber()
  order?: number;
}
