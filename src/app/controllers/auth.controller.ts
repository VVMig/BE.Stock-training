import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { AUTH_ENPOINTS, CONTROLLER_ENDPOINTS } from 'src/constants/Endpoints';
import { LoginDto } from 'src/dtos/Login.dto';
import { RegisterDto } from 'src/dtos/Register.dto';
import { AuthService } from '../services';

@ApiTags('Auth')
@Controller(CONTROLLER_ENDPOINTS.AUTH)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post(AUTH_ENPOINTS.REGISTER)
  async register(@Body() _body: RegisterDto) {
    const user = await this.authService.registerUser(_body);

    return user;
  }

  @UseGuards(AuthGuard('local'))
  @Post(AUTH_ENPOINTS.LOGIN)
  async login(@Request() req, @Body() _body: LoginDto) {
    return this.authService.login(req.user);
  }
}
