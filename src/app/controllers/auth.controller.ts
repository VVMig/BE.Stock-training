import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AUTH_ENPOINTS, CONTROLLER_ENDPOINTS } from 'src/constants/Endpoints';
import { LoginDto } from 'src/dtos/Login.dto';
import { RegisterDto } from 'src/dtos/Register.dto';
import { AccessTokenGuard } from 'src/guards/access-token.guard';
import { RefreshTokenGuard } from 'src/guards/refresh-token.guard';
import { AuthService } from '../services';

@ApiTags('Auth')
@Controller(CONTROLLER_ENDPOINTS.AUTH)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @Post(AUTH_ENPOINTS.SIGNOUT)
  async signout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken');
  }
}
