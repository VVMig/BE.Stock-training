import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  CONTROLLER_ENDPOINTS,
  STRATEGY_ENDPOINTS,
  TRADING_ENDPOINTS,
} from 'src/constants/Endpoints';
import { TIMEFRAMES } from 'src/constants/Timeframes';
import { TradingResultDto } from 'src/dtos/TradingResult.dto';
import { AccessTokenGuard } from 'src/guards/access-token.guard';
import { IFutureQuery, IKlineQuery, TradeState } from 'src/interfaces';
import { StrategyService, TradingService } from '../services';
import { CreateStrategyDto } from 'src/dtos/CreateStrategy.dto';

@ApiTags('Strategy')
@Controller(CONTROLLER_ENDPOINTS.STRATEGY)
export class StrategyController {
  constructor(private readonly strategyService: StrategyService) {}

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Get(STRATEGY_ENDPOINTS.ALL)
  async getAll(@Request() req) {
    return this.strategyService.getAllStrategies(req.user);
  }

  @Get(STRATEGY_ENDPOINTS.GET)
  async getStrategy(@Request() req, @Param('uuid') uuid: string) {
    return this.strategyService.findStrategyByUuid(uuid);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Post(STRATEGY_ENDPOINTS.CREATE)
  async create(@Body() body: CreateStrategyDto, @Request() req) {
    return this.strategyService.create(req.user, body);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Delete(STRATEGY_ENDPOINTS.REMOVE)
  async remove(@Param('uuid') uuid: string, @Request() req) {
    return this.strategyService.removeStrategy(req.user, uuid);
  }
}
