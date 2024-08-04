import { PartialType, PickType } from '@nestjs/mapped-types';
import { RegisterDTO } from './register.dto';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterInputs extends PickType(RegisterDTO, ['name', 'email', 'password', 'avatar'] as const) {
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}
