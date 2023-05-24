import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { USERS_ENDPOINTS } from 'src/constants/Endpoints';
import { Roles as RolesEnum } from 'src/constants/Roles';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateUserDto } from 'src/dtos/CreateUser.dto';
import { SetAdminDTO } from 'src/dtos/SetAdmin.dto';
import { SubsribePriceDto } from 'src/dtos/SubscribePrice.dto';
import { AccessTokenGuard } from 'src/guards/access-token.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { IQueryPage } from 'src/interfaces';
import { UsersService } from '../services';
import { CreateDateDTO } from 'src/dtos/User.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get(USERS_ENDPOINTS.GET_DATES)
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  getDate(@Request() req) {
    return req.user.dates;
  }

  @Get()
  @ApiBearerAuth()
  @Roles(RolesEnum.ADMIN)
  @UseGuards(AccessTokenGuard, RolesGuard)
  getUsers() {
    return this.userService.getUsers();
  }

  @Get(USERS_ENDPOINTS.USER_BRIEF_STATS)
  getBriefStats(@Param('uuid') uuid: string) {
    return this.userService.getBriefStats(uuid);
  }

  @Put(USERS_ENDPOINTS.SET_ADMIN)
  @ApiBearerAuth()
  @Roles(RolesEnum.USER)
  @UseGuards(AccessTokenGuard, RolesGuard)
  setAdmin(@Body() body: SetAdminDTO) {
    return this.userService.setAdmin(body.userUuid, body.admin);
  }

  @Get(USERS_ENDPOINTS.USER)
  async getUser(@Param('uuid') uuid: string) {
    try {
      const user = await this.userService.findUsersByUuid(uuid);

      return user;
    } catch (error) {
      return {};
    }
  }

  @Get(USERS_ENDPOINTS.USER_HISTORY)
  findUsersById(@Param('uuid') uuid: string, @Query() queryParams: IQueryPage) {
    const { page = 1, limit = 10 } = queryParams;

    return this.userService.getTradeHistory(uuid, page, limit);
  }

  @Post(USERS_ENDPOINTS.CREATE)
  @UsePipes(ValidationPipe)
  createUsers(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Put(USERS_ENDPOINTS.SUBSCRIBE_PRICE)
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  subscribe(@Request() req, @Body() body: SubsribePriceDto) {
    return this.userService.subscribeToPrice(
      req.user,
      body.time,
      body.interval,
      body.type,
    );
  }

  @Put(USERS_ENDPOINTS.UNSUBSCRIBE_PRICE)
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  unsubscribe(@Request() req) {
    return this.userService.unsubscribeFromPrice(req.user);
  }

  @Post(USERS_ENDPOINTS.ADD_DATE)
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  addDate(@Request() req, @Body() body: CreateDateDTO) {
    return this.userService.addDate(body, req.user);
  }

  @Delete(USERS_ENDPOINTS.REMOVE_DATE)
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  removeDate(@Request() req, @Query('id') id: string) {
    return this.userService.removeDate(id, req.user);
  }
}
