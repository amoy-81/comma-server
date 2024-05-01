import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { CreateUserInput } from '../user/dto/create-user.input';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async generateToken(user: User) {
    // generate token
    const token = this.jwtService.sign({ id: user._id });
    return token;
  }

  async register(createUserInput: CreateUserInput) {
    const user = await this.userService.create(createUserInput);
    return this.generateToken(user);
  }

  async authentication(user: any) {
    const findedUser = await this.userService.findUserByEmail(user.email);

    if (findedUser) return this.generateToken(findedUser);

    user.password = null;
    if (!findedUser) return this.register(user);
  }
}
