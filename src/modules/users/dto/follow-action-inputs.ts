import { IsNotEmpty, IsNumber } from 'class-validator';

export class FollowActionInputs {
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
