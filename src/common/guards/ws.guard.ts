import { CanActivate, Injectable, Optional } from '@nestjs/common';
import { UserService } from '../../modules/user/user.service';
import { verify } from 'jsonwebtoken';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}
  canActivate(context: any): any {
    return true;
  }

  static validate(token: string) {
    try {
      const jwtVerifyedData: any = verify(token, process.env.JWT_SECRET);

      return jwtVerifyedData;
    } catch (error) {
      throw new WsException('token not valid');
    }
  }
}
