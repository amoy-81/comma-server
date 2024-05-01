import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleOauthGuard } from 'src/common/guards/google-oauth.guard';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  googleAuth() {
    return 'Is Loggin';
  }

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    // add name and avatar in user object for save to db
    req.user.name = `${req.user.firstName} ${req.user.lastName}`;
    req.user.avatar = req.user.picture;

    const token = await this.authService.authentication(req.user);

    res.cookie('access_token', token, {
      maxAge: 2592000000,
      sameSite: true,
      secure: false,
    });

    // TODO : add front end login url
    return res.redirect(`http://localhost:4000/auth/login/verify`);
  }
}
