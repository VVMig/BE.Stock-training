import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  CONTROLLER_ENDPOINTS,
  TRADING_ENDPOINTS,
} from 'src/constants/Endpoints';
import { TIMEFRAMES } from 'src/constants/Timeframes';
import { TradingResultDto } from 'src/dtos/TradingResult.dto';
import { AccessTokenGuard } from 'src/guards/access-token.guard';
import { IFutureQuery, IKlineQuery } from 'src/interfaces';
import { TradingService } from '../services';

@ApiTags('Trading')
@Controller(CONTROLLER_ENDPOINTS.TRADING)
export class TradingController {
  constructor(private readonly tradingService: TradingService) {}

  @Get(TRADING_ENDPOINTS.PAST)
  @ApiQuery({
    name: 'symbol',
    type: 'string',
    required: true,
  })
  @ApiQuery({
    name: 'interval',
    required: true,
    enum: Object.values(TIMEFRAMES),
  })
  @ApiQuery({
    name: 'date',
    type: 'number',
    required: false,
  })
  async past(@Query() { symbol, interval, date }: IKlineQuery) {
    const tradeData = await this.tradingService.getTradingData(
      symbol,
      interval,
      +date,
    );

    return tradeData;
  }

  @Get(TRADING_ENDPOINTS.FUTURE)
  @ApiQuery({
    name: 'symbol',
    type: 'string',
    required: true,
  })
  @ApiQuery({
    name: 'interval',
    required: true,
    enum: Object.values(TIMEFRAMES),
  })
  @ApiQuery({
    name: 'date',
    type: 'number',
    required: true,
  })
  async future(@Query() { date, symbol, interval }: IFutureQuery) {
    const tradeData = await this.tradingService.getFutureTradingData(
      symbol,
      interval,
      +date,
    );

    return tradeData;
  }

  @UseGuards(AccessTokenGuard)
  @Post(TRADING_ENDPOINTS.CANCEL)
  async cancel(@Body() body: TradingResultDto, @Request() req) {
    return this.tradingService.setTradeResult(
      req.user,
      +body.initialBet,
      +body.closeBet,
      body.currency,
      body.tradeState as 'long' | 'short',
    );
  }
}
