import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { PostgresErrorCode } from 'src/constraints/errors.constraint';
import { RegisterDto } from 'src/dtos/Register.dto';
import { ConfirmPasswordException } from 'src/exceptions/confirm-password.exception';
import { UserAlreadyExistException } from 'src/exceptions/user-already-exist.exception';
import { AuthenticationProvider } from 'src/providers/auth.provider';
import { User } from 'src/typeorm';
import { UsersService } from '../services';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findUserBy({
      email,
    });

    const isEqual = await AuthenticationProvider.compare(
      password,
      user.password,
    );

    if (isEqual) {
      return user;
    }

    return null;
  }

  async login(user: User) {
    const tokens = await this.getTokens(user.uuid, user.name);

    return {
      ...tokens,
      user,
    };
  }

  async registerUser(body: RegisterDto) {
    const { name, email, password, confirmPassword } = body;

    if (password !== confirmPassword) {
      throw new ConfirmPasswordException();
    }

    try {
      const user = await this.usersService.createUser({
        name,
        password,
        email,
      });

      return this.login(user);
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new UserAlreadyExistException();
      }

      throw new InternalServerErrorException();
    }
  }

  async getTokens(userUuid: string, name: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userUuid,
          name,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userUuid,
          name,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
