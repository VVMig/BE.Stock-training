import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AUTH_ENPOINTS, CONTROLLER_ENDPOINTS } from 'src/constants/Endpoints';
import { PasswordChangeDTO } from 'src/dtos/ChangePassword.dto';
import { LoginDto } from 'src/dtos/Login.dto';
import { PasswordResetDTO } from 'src/dtos/PasswordReset.dto';
import { PasswordResetEmailDTO } from 'src/dtos/PasswordResetEmail.dto';
import { RegisterDto } from 'src/dtos/Register.dto';
import { AccessTokenGuard } from 'src/guards/access-token.guard';
import { GoogleOauthGuard } from 'src/guards/google-oauth.guard';
import { RefreshTokenGuard } from 'src/guards/refresh-token.guard';
import { AuthService } from '../services';

@ApiTags('Auth')
@Controller(CONTROLLER_ENDPOINTS.AUTH)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post(AUTH_ENPOINTS.REGISTER)
  async register(
    @Body() _body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...user } = await this.authService.registerUser(
      _body,
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
    });

    return user;
  }

  @UseGuards(GoogleOauthGuard)
  @Post(AUTH_ENPOINTS.GOOGLE)
  async googleAuth(@Req() req) {
    return this.authService.googleLogin(req.user?.email, req.user?.name);
  }

  @UseGuards(GoogleOauthGuard)
  @Get(AUTH_ENPOINTS.GOOGLE_CALLBACK)
  async googleAuthCallback(@Req() req) {
    return this.authService.googleLogin(req.user?.email, req.user?.name);
  }

  @UseGuards(AuthGuard('local'))
  @Post(AUTH_ENPOINTS.LOGIN)
  async login(
    @Request() req,
    @Body() _body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...user } = await this.authService.login(req.user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
    });

    return user;
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Get(AUTH_ENPOINTS.AUTHORIZE)
  async auth(@Request() req) {
    return req.user;
  }

  @UseGuards(RefreshTokenGuard)
  @Get(AUTH_ENPOINTS.REFRESH)
  async refreshTokens(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...user } = await this.authService.refreshTokens(
      req.user,
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
    });

    return user;
  }

  @Post(AUTH_ENPOINTS.PASSWORD_RESET_EMAIL)
  async sendResetPasswordEmail(@Body() body: PasswordResetEmailDTO) {
    return this.authService.sendPasswordResetEmail(body.email);
  }

  @Post(AUTH_ENPOINTS.PASSWORD_RESET)
  async setNewPassword(@Body() body: PasswordResetDTO) {
    return this.authService.setNewPassword(body.password, body.token);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Put(AUTH_ENPOINTS.PASSWORD_CHANGE)
  async changePassword(@Body() body: PasswordChangeDTO, @Request() req) {
    return this.authService.changePassword(
      req.user,
      body.currentPassword,
      body.newPassword,
    );
  }

  @Get(AUTH_ENPOINTS.VERIFY)
  async verify(@Param('token') token: string, @Res() res: Response) {
    const verified = await this.authService.verify(token);

    if (verified) {
      res.redirect(this.configService.get('CLIENT_EMAIL_SUCCESS_URL'));
    } else {
      res.redirect(this.configService.get('CLIENT_EMAIL_ERROR_URL'));
    }

    return;
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Post(AUTH_ENPOINTS.RESEND_EMAIL)
  async resend(@Request() req) {
    await this.authService.sendConfirmationEmail(req.user);

    return;
  }

  @Post(AUTH_ENPOINTS.SIGNOUT)
  async signout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken');
  }
}
