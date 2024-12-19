import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateNewsPaperInfoDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  posterId?: number;
}
