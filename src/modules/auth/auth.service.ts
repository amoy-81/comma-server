import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterDTO } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { AuthMessage } from './messages/auth.message';
import * as bcrypt from 'bcrypt';
import { LoginDTO } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UsersService) {}
  async register(registerDto: RegisterDTO) {
    // Check if a user with the given email already exists
    const existingUser = await this.userService.findUserByEmail(
      registerDto.email,
    );
    if (existingUser)
      throw new HttpException(AuthMessage.alreadyExists, HttpStatus.CONFLICT);

    // Hash the password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    registerDto.password = hashedPassword;

    const createUserResult = await this.userService.createUser(registerDto);

    return createUserResult;
  }

  async login(loginDto: LoginDTO) {
    // Find the user by email
    const user = await this.userService.findUserByEmail(loginDto.email);
    if (!user) {
      throw new HttpException(AuthMessage.notFound, HttpStatus.UNAUTHORIZED);
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new HttpException(
        AuthMessage.notMatchPassword,
        HttpStatus.UNAUTHORIZED,
      );
    }

    return user;
  }
  //  TODO: Google login
}
