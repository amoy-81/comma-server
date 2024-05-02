import { HttpException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { CreateUserInput } from '../user/dto/create-user.input';
import { LoginInput } from './dto/login-input';
import * as bcrypt from 'bcrypt';
import { AuthMessage } from './messages/auth.message';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  generateToken(user: User) {
    // generate access token with 7 days expiration
    const token = this.jwtService.sign({ id: user._id }, { expiresIn: '7d' });

    // generate refresh token with 30 days expiration
    const refreshToken = this.jwtService.sign(
      { id: user._id },
      { secret: process.env.JWT_RT_SECRET, expiresIn: '30d' },
    );

    // return token values
    return { token, refreshToken };
  }

  async authentication(user: any) {
    // check the user exists in the database
    const findedUser = await this.userService.findUserByEmail(user.email);

    // if there is a user, a token will be issued to her
    if (findedUser) return this.generateToken(findedUser);

    // Because the user is logged in with a Google account, a password is not registered for him
    user.password = null;

    // if the user does not exist, register
    if (!findedUser) return this.register(user);
  }

  async register(createUserInput: CreateUserInput) {
    // create user
    const user = await this.userService.create(createUserInput);
    // login
    return this.generateToken(user);
  }

  async login(loginInput: LoginInput) {
    // find user by entered username
    const user = await this.userService.findUserByEmail(loginInput.email);
    // if there is no such user throw an error
    if (!user) throw new HttpException(AuthMessage.notFound, 404);
    // compare passwords
    const isMatchPassword = await bcrypt.compare(
      loginInput.password,
      user.password.toString(),
    );
    // if passwords do not match throw an error
    if (!isMatchPassword)
      throw new HttpException(AuthMessage.notMatchPassword, 401);
    // generate a token
    return this.generateToken(user);
  }

  async refreshToken(refreshToken: string) {
    try {
      // verify the refresh token and get payload
      const verifyTokenData = await this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_RT_SECRET,
      });

      // If the token does not exist, an http error will be returned
      if (!verifyTokenData)
        throw new HttpException(AuthMessage.unauthorized, 401);

      // get user data from payload
      const user = await this.userService.findById(verifyTokenData.id);

      // If the user does not exist, an http error will be returned
      if (!user) throw new HttpException(AuthMessage.unauthorized, 401);

      // generate new token for user and return
      return this.generateToken(user);
    } catch (error: any) {
      // If there is an error, we will return an http error
      throw new HttpException(error.message || AuthMessage.unauthorized, 401);
    }
  }
}
