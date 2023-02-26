import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/app/services';

const cookieExtractor = (req: Request) => {
  let token = null;

  if (req && req.cookies) token = req.cookies['refreshToken'];

  return token;
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private userService: UsersService) {
    super({
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.JWT_REFRESH_SECRET,
    });
  }

  validate(payload: any) {
    const user = this.userService.findUsersByUuid(payload.sub);

    return user;
  }
}
