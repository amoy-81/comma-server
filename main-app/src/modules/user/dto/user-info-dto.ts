import { Field, PartialType, ObjectType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

@ObjectType()
export class UserInfoDto extends PartialType(User) {
  @Field(() => [User])
  followers: [User];
}
