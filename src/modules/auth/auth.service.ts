import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterDTO } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { AuthMessage } from './messages/auth.message';
import * as bcrypt from 'bcrypt';
import { LoginDTO } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDTO } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  async register(registerDto: RegisterDTO) {
    // Check if a user with the given email already exists
    const existingUser = await this.userService.findUserByEmail(
      registerDto.email,
    );
    if (existingUser)
      throw new HttpException(AuthMessage.alreadyExists, HttpStatus.CONFLICT);

    // Hash the password
    const hashedPassword = registerDto.password
      ? await bcrypt.hash(registerDto.password, 10)
      : null;
    registerDto.password = hashedPassword;

    const createUserResult = await this.userService.createUser(registerDto);

    const { token } = this.generateToken(createUserResult);
    const { password, ...userData } = createUserResult;

    return { token, user: userData };
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

    const { token } = this.generateToken(user);

    const { password, ...userData } = user;

    return { token, user: userData };
  }

  async googleLogin(user: any) {
    // check the user exists in the database
    const findedUser = await this.userService.findUserByEmail(user.email);

    // if there is a user, a token will be issued to her
    if (findedUser) {
      const { password, ...userData } = findedUser;
      const { token } = this.generateToken(findedUser);
      return { token, user: userData };
    }

    // if the user does not exist, register
    if (!findedUser)
      return this.register({
        name: user.name,
        email: user.email,
        password: null,
        avatar: user.avatar,
      });
  }

  async changePassword(dto: ChangePasswordDTO, userId: number) {
    const user = await this.userService.findUserById(userId);

    const isOldPasswordValid = await bcrypt.compare(
      dto.old_password,
      user.password,
    );

    if (!isOldPasswordValid) {
      throw new HttpException(
        AuthMessage.notMatchPassword,
        HttpStatus.CONFLICT,
      );
    }

    const newHashedPassword = await bcrypt.hash(dto.new_password, 10);

    user.password = newHashedPassword;

    await this.userService.changePassword(userId, newHashedPassword);

    return { success: true, message: AuthMessage.successChangePass };
  }

  generateToken(user: User) {
    // generate access token with 30 days expiration
    const token = this.jwtService.sign({ id: user.id }, { expiresIn: '30d' });

    // return token values
    return { token };
  }
}
