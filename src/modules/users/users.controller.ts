import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { saveInStorage } from 'src/common/firebase/firebase.util';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search')
  @UseGuards(JwtAuthGuard)
  async searchUsers(
    @Query('name') name?: string,
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    return await this.usersService.searchUsers(
      page == 0 ? 1 : page,
      limit == 0 ? 1 : limit,
      name,
    );
  }

  @Get('profile/:id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findUserById(id);
    const { password, ...result } = user;

    const relatedPeople = await this.usersService.getUserFollowDetails(id);

    return { user: result, related: relatedPeople };
  }

  @Put('follow-action/:id')
  @UseGuards(JwtAuthGuard)
  async followAction(
    @Req() req: any,
    @Param('id', ParseIntPipe) userId: number,
  ) {
    return await this.usersService.followUser(req.user.id, userId);
  }

  @Put('unfollow-action/:id')
  @UseGuards(JwtAuthGuard)
  async unFollowAction(
    @Req() req: any,
    @Param('id', ParseIntPipe) userId: number,
  ) {
    return await this.usersService.unfollowUser(req.user.id, userId);
  }

  @Put('update/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateUser(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: Partial<User>,
    @UploadedFile() pictureFile: Express.Multer.File,
  ) {
    if (req.user.id !== id)
      throw new HttpException('You cannot do this', HttpStatus.FORBIDDEN);

    const picturePath = pictureFile ? await saveInStorage(pictureFile) : null;

    if (picturePath) {
      updateUserDto.avatar = picturePath;
    }

    return this.usersService.updateUser(id, updateUserDto);
  }
}
