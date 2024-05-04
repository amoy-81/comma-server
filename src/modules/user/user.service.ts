import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model, Schema as MongooseSchema } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserMessage } from './messages/user.message';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserInput: CreateUserInput) {
    // Check if the email is already in use
    const user = await this.findUserByEmail(createUserInput.email);

    // if the user already exists throw an error
    if (user) throw new HttpException(UserMessage.alreadyExists, 409);

    // otherwise hash and save the password
    if (createUserInput.password) {
      createUserInput.password = await bcrypt.hash(createUserInput.password, 5);
    }

    // create a new user and return it
    const newUser = await this.userModel.create(createUserInput);

    return newUser;
  }

  async followAndUnfollow(selectedUserId: string, userData: User) {
    try {
      // get selected user model from db
      const selectedUser = await this.findById(selectedUserId);

      // if there is no user or the user gave his _id
      if (!selectedUser || selectedUserId === userData._id.toString())
        throw new HttpException(UserMessage.unableUser, 409);

      // if the user was already following this account, unfollow and follow if not
      if (userData.followers.includes(selectedUser._id))
        return await this.unFollowAction(
          selectedUser._id,
          userData._id.toString(),
        );
      else
        return await this.followAction(
          selectedUser._id,
          userData._id.toString(),
        );
    } catch (error: any) {
      throw new HttpException(UserMessage.unableUser, 409);
    }
  }

  async unFollowAction(
    selectedUserId: MongooseSchema.Types.ObjectId,
    userId: string,
  ) {
    // Get User Model From DB
    const user = await this.findById(userId);
    console.log(user.followers);
    // Delete Selected User From User Followers Array
    const filteredFollowesArray: MongooseSchema.Types.ObjectId[] =
      user.followers.filter(
        (item) => item.toString() !== selectedUserId.toString(),
      );
    user.followers = filteredFollowesArray;
    // Save Changes
    await user.save();
    // return message
    return UserMessage.unFollow;
  }

  async followAction(
    selectedUserId: MongooseSchema.Types.ObjectId,
    userId: string,
  ) {
    // Get User Model From DB
    const user = await this.findById(userId);
    // Add Selected User In User Followers Array
    user.followers.push(selectedUserId);
    // Save Changes
    await user.save();
    // return message
    return UserMessage.follow;
  }

  async findUserByEmail(email: string) {
    const user = await this.userModel.findOne({ email });
    return user;
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id);
    return user;
  }

  findAll() {
    return this.userModel.find();
  }
}
