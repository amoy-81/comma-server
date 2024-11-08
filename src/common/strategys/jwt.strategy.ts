import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { AuthService } from 'src/modules/auth/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    if (!payload || payload.type !== 'ACCESS_TOKEN')
      throw new UnauthorizedException('Token Not valid');

    const session = await this.authService.getSession(payload.sessionId);

    if (!session || session.expireDate < new Date()) {
      throw new UnauthorizedException('Session has expired');
    }

    const user = await this.userService.findUserById(session.userId as number);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
