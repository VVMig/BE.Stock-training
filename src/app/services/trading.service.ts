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
import {
  IKlineResponse,
  IPageResponse,
  ITradingData,
  TradeState,
} from 'src/interfaces';
import { Strategy, TradeHistory, User } from 'src/typeorm';
import { Connection, Repository } from 'typeorm';
import { StrategyService } from './strategy.service';

@Injectable()
export class TradingService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(TradeHistory)
    private readonly tradeHistoryRepository: Repository<TradeHistory>,
    private readonly strategyService: StrategyService,
    private readonly _connection: Connection,
  ) {}

  async getTradingData(
    symbol: string,
    interval: string | number,
    date: number,
    limit = 200,
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
            limit,
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
    strategyId: string,
    initialBet: number,
    closeBet: number,
    stakeAmount: number,
    currency: CRYPTOCURRENCY_SHORT,
    tradeState: TradeState,
    margin: number,
  ) {
    const strategy = await this.strategyService.findStrategyByUuid(strategyId);

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
        margin,
        strategy: strategy,
      });

      const percent = +(
        1 -
        Math.min(initialBet, closeBet) / Math.max(initialBet, closeBet)
      );

      const isPositiveValue =
        tradeState === 'LONG' ? closeBet >= initialBet : closeBet <= initialBet;

      const currentValue = +(
        isPositiveValue
          ? stakeAmount * margin * percent
          : -stakeAmount * margin * percent
      ).toFixed(2);

      strategy.funds = +strategy.funds + currentValue;

      await this.strategyService.updateStrategy(strategyId, strategy);

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

  async getBriefStats(strategyId: string) {
    const [trades, totalTrades] =
      await this.tradeHistoryRepository.findAndCountBy({
        strategy: {
          uuid: strategyId,
        },
      });

    const [winTrades, loseTrades] = trades.reduce(
      (acc, trade) => {
        if (trade.tradeState === 'LONG') {
          if (trade.initialBet < trade.closeBet) {
            acc[0] = acc[0] + 1;
          } else {
            acc[1] = acc[1] + 1;
          }
        } else {
          if (trade.initialBet < trade.closeBet) {
            acc[1] = acc[1] + 1;
          } else {
            acc[0] = acc[0] + 1;
          }
        }

        return acc;
      },
      [0, 0],
    );

    return {
      winTrades,
      loseTrades,
      totalTrades,
    };
  }

  async getTradeHistory(
    strategyId: string,
    page: number,
    limit: number,
  ): Promise<IPageResponse<TradeHistory>> {
    const [trades, total] = await this.tradeHistoryRepository.findAndCount({
      where: {
        strategy: {
          uuid: strategyId,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: trades,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}
