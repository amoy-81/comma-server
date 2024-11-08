import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterDTO } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { AuthMessage } from './messages/auth.message';
import * as bcrypt from 'bcrypt';
import { LoginDTO } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth) private readonly authRepo: Repository<Auth>,
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

    const { accessToken, refreshToken } = await this.generateToken(
      createUserResult.id,
    );

    const { password, ...userData } = createUserResult;

    return { accessToken, refreshToken, user: userData };
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

    const { accessToken, refreshToken } = await this.generateToken(user.id);

    const { password, ...userData } = user;

    return { accessToken, refreshToken, user: userData };
  }

  async googleLogin(user: any) {
    // check the user exists in the database
    const findedUser = await this.userService.findUserByEmail(user.email);

    // if there is a user, a token will be issued to her
    if (findedUser) {
      const { password, ...userData } = findedUser;

      const { accessToken, refreshToken } = await this.generateToken(
        findedUser.id,
      );

      return { accessToken, refreshToken, user: userData };
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

  async getSession(sessionId: string) {
    return await this.authRepo.findOne({ where: { sessionId } });
  }

  // Refresh Token Service
  async refreshToken(rt: string) {
    // decrypt
    const { type, sessionId } = this.jwtService.decode(rt);

    if (!type || !sessionId || type !== 'REFRESH_TOKEN')
      throw new HttpException('Token is Not Valid', HttpStatus.UNAUTHORIZED);

    // get session from db
    const session = await this.authRepo.findOne({ where: { sessionId } });

    if (!session || session.expireDate < new Date()) {
      await this.authRepo.delete(session.sessionId);
      throw new HttpException('Session Expired', HttpStatus.UNAUTHORIZED);
    }

    // update expired date
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 7);

    session.expireDate = expiration;

    await this.authRepo.save(session);

    // new Token and refreshToken
    const accessToken = this.jwtService.sign(
      { sessionId: session.sessionId, type: 'ACCESS_TOKEN' },
      { expiresIn: '1h' },
    );

    const refreshToken = this.jwtService.sign(
      { sessionId: session.sessionId, type: 'REFRESH_TOKEN' },
      { expiresIn: '7d' },
    );

    return { accessToken, refreshToken };
  }
  // whoIm Service

  async generateToken(userId: number) {
    const newSession = this.authRepo.create({ userId });

    const resalt = await this.authRepo.save(newSession);

    const accessToken = this.jwtService.sign(
      { sessionId: resalt.sessionId, type: 'ACCESS_TOKEN' },
      { expiresIn: '1h' },
    );

    const refreshToken = this.jwtService.sign(
      { sessionId: resalt.sessionId, type: 'REFRESH_TOKEN' },
      { expiresIn: '7d' },
    );

    return { accessToken, refreshToken };
  }
}
