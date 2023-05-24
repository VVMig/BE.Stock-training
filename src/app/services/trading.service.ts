import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { CRYPTOCURRENCY_SHORT, currencyColorMap } from 'src/constants/Currency';
import { UserNotFoundException } from 'src/exceptions/user-not-found.exception';
import {
  calculateProfit,
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
import { CsvService } from './csv.sevice';

@Injectable()
export class TradingService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(TradeHistory)
    private readonly tradeHistoryRepository: Repository<TradeHistory>,
    private readonly strategyService: StrategyService,
    private readonly _connection: Connection,
    private readonly csvService: CsvService,
  ) {}

  async getTradingData(
    symbol: string,
    interval: string | number,
    date: number,
    limit = 200,
  ): Promise<ITradingData> {
    const randomEndDate = date ? new Date(date) : getRandomDate();

    const endDates = [];
    const startDates = [];
    const requests = [];

    for (let i = 0; i < 10; i++) {
      const endDate = i === 0 ? randomEndDate.getTime() : startDates[i - 1];
      const startDate = getStartDate(new Date(endDate), interval);

      endDates.push(endDate);
      startDates.push(startDate);

      requests.push(
        axios
          .get<IKlineResponse>(
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
          )
          .then((res) => res.data),
      );
    }

    try {
      const data = await Promise.all(requests);

      const mappedData = mappedRequestData(
        data.map((item) => item.result.list).flat(),
      );

      return {
        endDate: endDates[0],
        startDate: startDates[startDates.length - 1],
        data: mappedData,
      };
    } catch (error) {
      return {
        endDate: endDates[0],
        startDate: startDates[startDates.length - 1],
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
        data: mappedRequestData(data.result.list),
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

      trade = this.tradeHistoryRepository.create({
        initialBet,
        closeBet,
        currency,
        tradeState,
        margin,
        funds: strategy.funds,
        strategy: strategy,
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
    order: 'ASC' | 'DESC' = 'DESC',
  ): Promise<IPageResponse<TradeHistory>> {
    const [trades, total] = await this.tradeHistoryRepository.findAndCount({
      where: {
        strategy: {
          uuid: strategyId,
        },
      },
      order: {
        createdAt: order,
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

  async getChartsInfo(strategyId: string) {
    const [trades, total] = await this.tradeHistoryRepository.findAndCount({
      where: {
        strategy: {
          uuid: strategyId,
        },
      },
    });

    const currenciesTradesPercent = trades.reduce((acc, trade) => {
      acc[trade.currency] = (acc[trade.currency] ?? 0) + 1;

      return acc;
    }, {});

    const tradesPercent = Object.keys(currenciesTradesPercent).map((key) => {
      return {
        name: key,
        value: +(currenciesTradesPercent[key] / total).toFixed(2) * 100,
        color: currencyColorMap[key],
      };
    });

    const currenciesWinsLose = Object.values(
      trades.reduce((acc, trade) => {
        const profit = calculateProfit(trade);

        if (profit > 0) {
          acc[trade.currency] = {
            lose: 0,
            ...acc[trade.currency],
            win: (acc[trade.currency]?.win ?? 0) + 1,
            name: trade.currency,
          };
        } else {
          acc[trade.currency] = {
            win: 0,
            ...acc[trade.currency],
            lose: (acc[trade.currency]?.lose ?? 0) + 1,
            name: trade.currency,
          };
        }

        return acc;
      }, {}),
    );

    const totalProfit = trades.reduce((acc, trade) => {
      return acc + calculateProfit(trade);
    }, 0);

    const profitPerCurrency = Object.entries(
      trades.reduce((acc, trade) => {
        acc[trade.currency] = +(
          (acc[trade.currency] ?? 0) + calculateProfit(trade)
        ).toFixed(2);

        return acc;
      }, {}),
    ).map(([key, value]) => ({
      name: key,
      value: value,
      color: currencyColorMap[key],
    }));

    return {
      winsLose: currenciesWinsLose,
      tradesPercent,
      totalProfit: +totalProfit.toFixed(2),
      profitPerCurrency,
      fundsMove: trades.map((trade) => ({
        value: trade.funds,
      })),
    };
  }

  async exportCSV(strategyId: string): Promise<string> {
    const csvHeaders = [
      { id: 'currency', title: 'Currency' },
      { id: 'initialBet', title: 'Initial Price' },
      { id: 'closeBet', title: 'Close Price' },
      { id: 'margin', title: 'Margin' },
      { id: 'tradeState', title: 'Trade State' },
      { id: 'profit', title: 'Profit %' },
      { id: 'funds', title: 'Funds' },
    ];

    const strategy = await this.strategyService.findStrategyByUuid(strategyId);

    const { data } = await this.getTradeHistory(strategyId, 1, 1, 'ASC');

    await this.csvService.createCsv(
      csvHeaders,
      data.map((trade) => ({
        ...trade,
        profit: calculateProfit(trade),
      })),
      strategy?.name,
    );

    return `${strategy?.name}.csv`;
  }
}
