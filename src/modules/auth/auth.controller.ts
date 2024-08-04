import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { GoogleOauthGuard } from 'src/common/guards/google-oauth.guard';
import { Request, Response } from 'express';
import { RegisterInputs } from './dto/register.inputs';
import { FileInterceptor } from '@nestjs/platform-express';
import { saveInStorage } from 'src/common/firebase/firebase.util';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  googleAuth() {
    return 'Google Login';
  }

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    // add name and avatar in user object for save to db
    req.user.name = `${req.user.firstName} ${req.user.lastName}`;
    req.user.avatar = req.user.picture;

    // try create new user or get existed one by email
    const { token } = await this.authService.googleLogin(req.user);

    // if authentication is successful then set cookies and send response
    this.setCookie(res, 'a_t', token);

    // TODO : add front end login url
    return res.redirect(`http://localhost:4000/auth/login/verify`);
  }

  @Post('register')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('avatar'))
  async create(
    @Res() res: Response,
    @Body() registerInputs: RegisterInputs,
    @UploadedFile() pictureFile: Express.Multer.File,
  ) {
    // Save the file in storage and get its download URL
    const picturePath = pictureFile ? await saveInStorage(pictureFile) : null;

    // Add the image download URL to the input data
    registerInputs.avatar = picturePath;

    // create new user in db
    const result = await this.authService.register(registerInputs);

    // Set access token in cookie
    this.setCookie(res, 'a_t', result.token);

    // return response with token, userDatas
    return res.status(201).json(result);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Res() res: Response, @Body() createAuthDto: LoginDTO) {
    // Login user by email and password
    const result = await this.authService.login(createAuthDto);
    // Set access token in cookie
    this.setCookie(res, 'a_t', result.token);
    // return response with token, userDatas
    return res.status(200).json(result);
  }

  private setCookie(res: Response, name: string, token: string) {
    // set cookie with jwt access token to client browser
    res.cookie(name, token, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      sameSite: true,
      secure: true,
      httpOnly: true,
    });
  }
}
