import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PostgresErrorCode } from 'src/constraints/errors.constraint';
import { RegisterDto } from 'src/dtos/Register.dto';
import { ConfirmPasswordException } from 'src/exceptions/confirm-password.exception';
import { UserAlreadyExistException } from 'src/exceptions/user-already-exist.exception';
import { UserNotFoundException } from 'src/exceptions/user-not-found.exception';
import { IAuthResponse } from 'src/interfaces';
import { AuthenticationProvider } from 'src/providers/auth.provider';
import { User } from 'src/typeorm';
import { Connection } from 'typeorm';
import { UsersService } from '../services';
import { MailService } from './mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
    private readonly _connection: Connection,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findUserBy({
      email,
    });

    if (!user) {
      return null;
    }

    const isEqual = await AuthenticationProvider.compare(
      password,
      user.password,
    );

    if (isEqual) {
      return user;
    }

    return null;
  }

  async login(user: User): Promise<IAuthResponse> {
    const tokens = await this.getTokens(user.uuid, user.name);

    return {
      ...tokens,
      user,
    };
  }

  async registerUser(body: RegisterDto): Promise<IAuthResponse> {
    const { name, email, password, confirmPassword } = body;

    if (password !== confirmPassword) {
      throw new ConfirmPasswordException();
    }

    const queryRunner = this._connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const user = await this.usersService.createUser({
        name,
        password,
        email,
      });

      await queryRunner.commitTransaction();

      this.sendConfirmationEmail(user);

      return this.login(user);
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new UserAlreadyExistException();
      }

      throw new InternalServerErrorException();
    }
  }

  async sendConfirmationEmail(user: User) {
    const token = this.jwtService.sign(
      {
        sub: user.uuid,
        name: user.name,
      },
      {
        secret: this.configService.get<string>('JWT_VERIFY_SECRET'),
        expiresIn: '24h',
      },
    );

    this.usersService.updateUser({
      ...user,
      verificationToken: token,
    });

    await this.mailService.sendUserConfirmation(user, token);
  }

  async googleLogin(email: string, name: string) {
    try {
      let user = await this.usersService.findUserBy({
        email,
      });

      if (!user) {
        user = await this.usersService.createUser({
          name,
          email,
          password: null,
        });
      }

      if (!user.verified) {
        user.verified = true;

        await this.usersService.updateUser(user);
      }

      return this.login(user);
    } catch (error) {}
  }

  async sendPasswordResetEmail(email: string) {
    const user = await this.usersService.findUserBy({
      email,
    });

    if (!user) {
      throw new BadRequestException(
        'Email has not been registered or verified yet',
      );
    }

    const resetToken = this.jwtService.sign(
      {
        sub: user.uuid,
      },
      {
        secret: this.configService.get<string>('JWT_RESET_SECRET'),
        expiresIn: '1h',
      },
    );

    user.resetToken = resetToken;

    await this.usersService.updateUser({
      ...user,
    });

    await this.mailService.sendResetPasswordEmail(user.email, resetToken);
  }

  async setNewPassword(newPassword: string, token: string) {
    const payload = this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_RESET_SECRET'),
    });

    if (!payload) {
      throw new BadRequestException('Invalid reset password link');
    }

    const user = await this.usersService.findUsersByUuid(payload.sub);

    if (!user || user?.resetToken !== token) {
      throw new BadRequestException('Invalid reset password link');
    }

    await this.usersService.updatePassword(newPassword, user);
  }

  async changePassword(
    user: User,
    currentPassword: string,
    newPassword: string,
  ) {
    const isEqual = await AuthenticationProvider.compare(
      currentPassword,
      user.password,
    );

    if (!isEqual) {
      throw new BadRequestException('Incorrect current password');
    }

    await this.usersService.updatePassword(newPassword, user);
  }

  async refreshTokens(user: User): Promise<IAuthResponse> {
    const tokens = await this.getTokens(user.uuid, user.name);

    return {
      ...tokens,
      user,
    };
  }

  async verify(token: string) {
    const payload = this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_VERIFY_SECRET'),
    });

    const user = await this.usersService.findUsersByUuid(payload.sub);

    if (user.verificationToken !== token || !payload) {
      return false;
    }

    user.verified = true;

    await this.usersService.updateUser(user);

    return true;
  }

  async getTokens(userUuid: string, name: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign(
        {
          sub: userUuid,
          name,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '1d',
        },
      ),
      this.jwtService.sign(
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
