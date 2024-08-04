import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
// import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @MessagePattern('createUser')
  // create(@Payload() createUserDto: CreateUserDto) {
  //   return this.usersService.create(createUserDto);
  // }

  // @MessagePattern('findAllUsers')
  // findAll() {
  //   return this.usersService.findAll();
  // }

  // @MessagePattern('findOneUser')
  // findOne(@Payload() id: number) {
  //   return this.usersService.findOne(id);
  // }

  // @MessagePattern('updateUser')
  // update(@Payload() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(updateUserDto.id, updateUserDto);
  // }

  // @MessagePattern('removeUser')
  // remove(@Payload() id: number) {
  //   return this.usersService.remove(id);
  // }

  // For test
  @Post('user')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Post('follow')
  async follow(@Body() { userId, fId }: { userId: number; fId: number }) {
    return this.usersService.followUser(userId, fId);
  }

  @Post('userselect')
  async getUserr(@Body() { userId }: { userId: number }) {
    return this.usersService.getUserFollowDetails(userId);
  }
  
  @Patch(':id')
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: Partial<User>,
  ) {
    return this.usersService.updateUser(id, updateUserDto);
  }
}
