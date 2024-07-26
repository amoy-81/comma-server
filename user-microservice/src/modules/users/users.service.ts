import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserMessage } from './messages/user.message';
import { Follow } from './entities/follow.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
  ) {}
  async createUser(createUserDto: CreateUserDto) {
    // Check if a user with the given email already exists in the repository
    const findUser = await this.findUserByEmail(createUserDto.email);
    // If user already exists, throw an exception with a conflict status
    if (findUser)
      throw new HttpException(UserMessage.alreadyExists, HttpStatus.CONFLICT);
    // Create a new user instance and assign the provided properties
    const newUser = new User();
    newUser.name = createUserDto.name;
    newUser.email = createUserDto.email;
    newUser.password = createUserDto.password;
    newUser.avatar = createUserDto.avatar;
    newUser.bio = createUserDto.bio;
    // Save the new user instance to the repository and return the result
    return await this.userRepository.save(newUser);
  }

  async followUser(userId: number, followedUserId: number) {
    // Find the user who is going to follow another user by their ID
    const user = await this.findUserById(userId);
    // Find the user who is going to be followed by their ID
    const followedUser = await this.findUserById(followedUserId);
    // If either user is not found, throw an exception with a not found status
    if (!user || !followedUser || userId === followedUserId)
      throw new HttpException(UserMessage.notFound, HttpStatus.NOT_FOUND);

    // Create a new Follow instance and set the follower and following properties
    const newFollow = new Follow();
    newFollow.follower = user;
    newFollow.following = followedUser;

    // Save the new Follow instance to the repository and return the result
    return await this.followRepository.save(newFollow);
  }

  async unfollowUser(userId: number, followedUserId: number) {
    // Find the user who is going to unfollow another user by their ID
    const user = await this.findUserById(userId);
    // Find the user who is going to be unfollowed by their ID
    const followedUser = await this.findUserById(followedUserId);
    // If either user is not found, throw an exception with a not found status
    if (!user || !followedUser)
      throw new HttpException(UserMessage.notFound, HttpStatus.NOT_FOUND);

    // Find the follow relationship between the two users
    const followItem = await this.followRepository.findOne({
      where: { follower: { id: user.id }, following: { id: followedUser.id } },
    });
    // If the follow relationship is not found, throw an exception
    if (!followItem)
      throw new HttpException('Nothing found', HttpStatus.NOT_FOUND);

    // Delete the follow relationship using the primary key of followItem
    const deleteResult = await this.followRepository.delete(followItem.id);
    // Return the result of the delete operation
    return { success: true, messgae: 'The user was unfollowed' };
  }

  async findUserByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async findUserById(id: number) {
    return await this.userRepository.findOne({
      where: { id },
    });
  }
}
