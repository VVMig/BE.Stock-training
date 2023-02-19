import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { USERS_ENDPOINTS } from 'src/constants/Endpoints';
import { CreateUserDto } from 'src/dtos/CreateUser.dto';
import { IQueryPage } from 'src/interfaces';
import { UsersService } from '../services';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  getUsers() {
    return this.userService.getUsers();
  }

  @Get('tradehistory/:uuid')
  findUsersById(@Param('uuid') uuid: string, @Query() queryParams: IQueryPage) {
    const { page = 1, limit = 10 } = queryParams;

    return this.userService.getTradeHistory(uuid, page, limit);
  }

  @Post(USERS_ENDPOINTS.CREATE)
  @UsePipes(ValidationPipe)
  createUsers(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }
}
