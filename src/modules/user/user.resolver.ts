import { Resolver, Query, Args, Context, Mutation, Int } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserInfoDto } from './dto/user-info-dto';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => String, { name: 'followAndUnfollow' })
  @UseGuards(JwtAuthGuard)
  followAndUnfollow(
    @Context() context,
    @Args('userId', { type: () => String }) userId: string,
  ) {
    return this.userService.followAndUnfollow(userId, context.req.user);
  }

  @Query(() => UserInfoDto, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async accountInfo(@Args('userId', { type: () => String }) userId: string) {
    return this.userService.getUserAccount(userId);
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return '';
  }

  @Mutation(() => User)
  removeUser(@Args('id', { type: () => Int }) id: number) {
    return 'a';
  }
}
