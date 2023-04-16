import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { CRYPTOCURRENCY_SHORT } from 'src/constants/Currency';
import { CreateStrategyDto } from 'src/dtos/CreateStrategy.dto';
import { UserNotFoundException } from 'src/exceptions/user-not-found.exception';
import {
  getEndDate,
  getRandomDate,
  getStartDate,
  mappedRequestData,
} from 'src/helpers';
import { IKlineResponse, ITradingData, TradeState } from 'src/interfaces';
import { Strategy, TradeHistory, User } from 'src/typeorm';
import { Connection, Repository } from 'typeorm';

@Injectable()
export class StrategyService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Strategy)
    private readonly strategyRepository: Repository<Strategy>,
  ) {}

  async getAllStrategies(user: User, page?: number, limit?: number) {
    const [strategies, total] = await this.strategyRepository.findAndCount({
      where: {
        user: {
          uuid: user.uuid,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: strategies,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findStrategyByUuid(uuid: string) {
    const strategy = await this.strategyRepository.findOne({
      where: {
        uuid,
      },
    });

    if (!strategy) {
      throw new BadRequestException('Strategy not found');
    }

    return strategy;
  }

  async updateStrategy(strategyId: string, strategy: CreateStrategyDto) {
    const strategyToUpdate = await this.strategyRepository.findOne({
      where: {
        uuid: strategyId,
      },
    });

    if (!strategyToUpdate) {
      throw new BadRequestException('Strategy not found');
    }

    if (strategy.funds < 1) {
      strategy.funds = 0;
    }

    const saved = await this.strategyRepository.save({
      ...strategyToUpdate,
      ...strategy,
      funds: strategy.funds,
    });

    return saved;
  }

  async findStrategyByUuidAndUser(uuid: string, user: User) {
    const strategy = await this.strategyRepository.findOne({
      where: {
        uuid,
        user: {
          uuid: user.uuid,
        },
      },
    });

    if (!strategy) {
      throw new BadRequestException('Strategy not found');
    }

    return strategy;
  }

  async create(user: User, strategy: CreateStrategyDto) {
    if (strategy.funds < 1) {
      throw new BadRequestException('Funds must be greater than 0');
    }

    if (strategy.name.length < 2) {
      throw new BadRequestException('Name must be at least 2 characters long');
    }

    return this.strategyRepository.save({
      ...strategy,
      user,
    });
  }

  async removeStrategy(user: User, strategyId: string) {
    const strategy = await this.strategyRepository.findOne({
      where: {
        uuid: strategyId,
        user: {
          uuid: user.uuid,
        },
      },
    });

    if (!strategy) {
      throw new BadRequestException('Strategy not found');
    }

    return this.strategyRepository.remove(strategy);
  }
}
