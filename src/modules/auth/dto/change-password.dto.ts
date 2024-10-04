import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDTO {
  @IsString()
  @IsNotEmpty()
  old_password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  new_password: string;
}
