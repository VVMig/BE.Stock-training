import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { CRYPTOCURRENCY_SHORT } from 'src/constants/Currency';
import { UserNotFoundException } from 'src/exceptions/user-not-found.exception';
import {
  getEndDate,
  getRandomDate,
  getStartDate,
  mappedRequestData,
} from 'src/helpers';
import { IKlineResponse, ITradingData } from 'src/interfaces';
import { TradeHistory, User } from 'src/typeorm';
import { Connection, DataSource, Repository } from 'typeorm';
import { UsersService } from './users.service';

@Injectable()
export class TradingService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(TradeHistory)
    private readonly tradeHistoryRepository: Repository<TradeHistory>,
    private readonly _connection: Connection,
  ) {}

  async getTradingData(
    symbol: string,
    interval: string | number,
    date: number,
  ): Promise<ITradingData> {
    const randomEndDate = date ? new Date(date) : getRandomDate();

    const endDate = randomEndDate.getTime();
    const startDate = getStartDate(randomEndDate, interval);

    try {
      const { data } = await axios.get<IKlineResponse>(
        'https://api.bybit.com/derivatives/v3/public/kline',
        {
          params: {
            symbol,
            interval,
            start: startDate,
            end: endDate,
          },
        },
      );

      const mappedData = mappedRequestData(data);

      return {
        endDate,
        startDate,
        data: mappedData,
      };
    } catch (error) {
      return {
        endDate,
        startDate,
        data: [],
      };
    }
  }

  async getFutureTradingData(
    symbol: string,
    interval: string | number,
    date: number,
  ): Promise<ITradingData> {
    const startDate = new Date(date);
    const endDate = getEndDate(startDate, interval);

    try {
      const { data } = await axios.get<IKlineResponse>(
        'https://api.bybit.com/derivatives/v3/public/kline',
        {
          params: {
            symbol,
            interval,
            start: startDate.getTime(),
            end: endDate,
          },
        },
      );

      return {
        endDate,
        startDate: startDate.getTime(),
        data: mappedRequestData(data),
      };
    } catch (error) {
      return {
        endDate,
        startDate: startDate.getTime(),
        data: [],
      };
    }
  }

  async setTradeResult(
    user: User,
    initialBet: number,
    closeBet: number,
    currency: CRYPTOCURRENCY_SHORT,
    tradeState: 'short' | 'long',
  ) {
    const queryRunner = this._connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    let trade: TradeHistory;

    try {
      trade = this.tradeHistoryRepository.create({
        initialBet,
        closeBet,
        currency,
        tradeState,
        user: user,
      });

      await this.tradeHistoryRepository.save(trade);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }

    return trade;
  }
}
