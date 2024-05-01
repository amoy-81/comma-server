import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserInput: CreateUserInput) {
    const user = await this.findUserByEmail(createUserInput.email);

    // if the user already exists throw an error
    if (user) throw new HttpException('user already exists', 409);

    // otherwise hash and save the password
    if (createUserInput.password) {
      createUserInput.password = await bcrypt.hash(createUserInput.password, 5);
    }

    // create a new user and return it
    const newUser = await this.userModel.create(createUserInput);

    return newUser;
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
