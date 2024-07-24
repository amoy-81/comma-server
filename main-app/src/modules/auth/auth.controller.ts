import {
  Controller,
  Get,
  UseGuards,
  Req,
  Res,
  Post,
  Body,
  HttpCode,
  HttpException,
  Headers,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleOauthGuard } from '../../common/guards/google-oauth.guard';
import { Response } from 'express';
import { UserService } from '../user/user.service';
import { CreateUserInput } from '../user/dto/create-user.input';
import { AuthMessage } from './messages/auth.message';
import { LoginInput } from './dto/login-input';
import { saveInStorage } from '../../common/firebase/firebase.util';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  googleAuth() {
    return 'Google Login';
  }

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    // add name and avatar in user object for save to db
    req.user.name = `${req.user.firstName} ${req.user.lastName}`;
    req.user.avatar = req.user.picture;

    // try create new user or get existed one by email
    const { token, refreshToken } = await this.authService.authentication(
      req.user,
    );

    // if authentication is successful then set cookies and send response
    this.setATandRTCookies(res, token, refreshToken);

    // TODO : add front end login url
    return res.redirect(`http://localhost:4000/auth/login/verify`);
  }

  @Post('register')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('avatar'))
  async register(
    @Res() res: Response,
    @Body() createUserInput: CreateUserInput,
    @UploadedFile() pictureFile: Express.Multer.File,
  ) {
    // Save the file in storage and get its download URL
    const picturePath = pictureFile ? await saveInStorage(pictureFile) : null;

    // Add the image download URL to the input data
    createUserInput.avatar = picturePath;

    // create new user and save it on database
    const user = await this.userService.create(createUserInput);

    // generate token for the newly created user
    const { token, refreshToken } = this.authService.generateToken(user);

    // if authentication is successful then set cookies and send response
    this.setATandRTCookies(res, token, refreshToken);

    // send response with status code 201 Created
    return res.json({ success: true, message: AuthMessage.successRegister });
  }

  @Post('login')
  @HttpCode(200)
  async login(@Res() res: Response, @Body() loginInput: LoginInput) {
    // call auth service method authenticate
    const { token, refreshToken } = await this.authService.login(loginInput);

    // if authentication is successful then set cookies and send response
    this.setATandRTCookies(res, token, refreshToken);

    // send response with status code 200
    return res.json({ success: true, message: AuthMessage.successLogin });
  }

  @Get('refresh-token')
  async refreshToken(
    @Headers('r_t') refreshTokenValue: string,
    @Res() res: Response,
  ) {
    // validate refresh token value
    if (!refreshTokenValue)
      throw new HttpException(AuthMessage.unauthorized, 401);

    // authenticate user by using refresh token
    const { token, refreshToken } =
      await this.authService.refreshToken(refreshTokenValue);

    // if authentication is successful then set cookies and send response
    this.setATandRTCookies(res, token, refreshToken);

    // send response with status code 200
    return res.json({
      success: true,
      message: AuthMessage.refreshTokenSuccess,
    });
  }

  private setATandRTCookies(
    res: Response,
    token: string,
    refreshToken: string,
  ) {
    // set cookie with jwt access token to client browser
    res.cookie('a_t', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: true,
      secure: false,
    });

    // set cookie with jwt refresh token to client browser
    res.cookie('r_t', refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      sameSite: true,
      secure: false,
    });
  }
}
