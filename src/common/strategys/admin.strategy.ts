import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../modules/users/users.service';
import { AuthService } from '../../modules/auth/auth.service';
import { UserRoles } from 'src/modules/users/entities/user.entity';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
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
    if (!payload || payload.type !== 'ACCESS_TOKEN') {
      throw new UnauthorizedException('Token Not valid');
    }

    const session = await this.authService.getSession(payload.sessionId);
    if (!session || session.expireDate < new Date()) {
      throw new UnauthorizedException('Session has expired');
    }

    const user = await this.userService.findUserById(session.userId as number);
    if (!user || user.role !== UserRoles.SUPER_USER) {
      throw new UnauthorizedException('Access Denied');
    }

    return user;
  }
}
