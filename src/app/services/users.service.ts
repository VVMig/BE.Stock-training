import { BadRequestException, Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosError } from 'axios';
import { CronJob } from 'cron';
import moment from 'moment';
import { CRYPTOCURRENCY_SHORT } from 'src/constants/Currency';
import { Roles } from 'src/constants/Roles';
import { CreateUserDto } from 'src/dtos/CreateUser.dto';
import { TradingResultDto } from 'src/dtos/TradingResult.dto';
import { UserNotFoundException } from 'src/exceptions/user-not-found.exception';
import { hoursToMilliseconds } from 'src/helpers';
import { IPageResponse, SubscriptionInterval } from 'src/interfaces';
import { Role, TradeHistory, User } from 'src/typeorm';
import { Repository } from 'typeorm';
import { MailService } from './mail.service';
import { TradingService } from './trading.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly tradingService: TradingService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(TradeHistory)
    private readonly tradeHistoryRepository: Repository<TradeHistory>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    private schedulerRegistry: SchedulerRegistry,
    private mailService: MailService,
  ) {}

  getUsers() {
    return this.userRepository.find();
  }

  updateUser({ password, ...updatedUser }: User) {
    return this.userRepository.save(updatedUser);
  }

  updatePassword(password: string, user: User) {
    return this.userRepository.save({
      ...user,
      password,
    });
  }

  async subscribeToPrice(
    user: User,
    time: number,
    interval: SubscriptionInterval,
    type: 'time' | 'interval',
  ) {
    if (user.subscribed) {
      throw new BadRequestException('Already subscribed');
    }

    let job: CronJob;
    let subscribedRules: string;

    if (type === 'time') {
      const minutes = new Date(time).getMinutes();
      const hours = new Date(time).getHours();

      subscribedRules = `0 ${minutes ?? '*'} ${hours ?? '*'} * * *`;

      job = new CronJob(subscribedRules, () => {
        this.sendEmailSubscriptionPrices(user);
      });

      this.schedulerRegistry.addCronJob(user.email, job);

      job.start();
    } else if (type === 'interval') {
      subscribedRules = interval;

      const milliseconds = hoursToMilliseconds(interval);

      this.sendEmailSubscriptionPrices(user);

      const intervalId = setInterval(() => {
        this.sendEmailSubscriptionPrices(user);
      }, milliseconds);

      this.schedulerRegistry.addInterval(user.email, intervalId);
    }

    await this.updateUser({
      ...user,
      subscribed: true,
      subscribedRules,
    });
  }

  async setAdmin(userUuid: string, admin: boolean) {
    const user = await this.findUsersByUuid(userUuid);

    const role = await this.roleRepository.findOne({
      relations: {
        users: true,
      },
      where: {
        name: Roles.ADMIN,
      },
    });

    if (admin) {
      if (user.roles.some(({ name }) => name === Roles.ADMIN)) {
        throw new BadRequestException('User is already Admin');
      }

      role.users.push(user);
    } else {
      if (!user.roles.some(({ name }) => name === Roles.ADMIN)) {
        throw new BadRequestException('User is not Admin');
      }

      role.users = role.users.filter((user) => user.uuid !== userUuid);
    }

    await this.roleRepository.save(role);
  }

  async unsubscribeFromPrice(user: User) {
    if (!user.subscribed) {
      throw new BadRequestException('You need to subscribe first');
    }

    if (user.subscribedRules.includes('*')) {
      this.schedulerRegistry.deleteCronJob(user.email);
    } else {
      this.schedulerRegistry.deleteInterval(user.email);
    }

    const updatedUser = await this.updateUser({
      ...user,
      subscribed: false,
      subscribedRules: '',
    });

    return updatedUser;
  }

  async sendEmailSubscriptionPrices(user: User) {
    try {
      const prices = await Promise.all(
        Object.values(CRYPTOCURRENCY_SHORT).map(async (symbol) => {
          const { data } = await this.tradingService.getTradingData(
            `${symbol}USDT`,
            '1',
            Date.now(),
            1,
          );

          return {
            symbol,
            price: data[0].close,
          };
        }),
      );

      this.mailService.sendEmailPricesSubscription(user, prices);
    } catch (error) {
      if (!(error instanceof AxiosError)) {
        this.sendEmailSubscriptionPrices(user);
      }
    }
  }

  async createUser(createUserDto: CreateUserDto) {
    const user = await this.userRepository.save(createUserDto);

    const role = await this.roleRepository.findOne({
      where: {
        name: Roles.USER,
      },
      relations: {
        users: true,
      },
    });

    role.users.push(user);

    await this.roleRepository.save(role);

    return user;
  }

  findUsersById(id: number) {
    return this.userRepository.findOneBy({
      id: id,
    });
  }

  async findUsersByUuid(uuid: string) {
    const user = await this.userRepository.findOneBy({
      uuid: uuid,
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  findUserBy(where: Partial<User>) {
    return this.userRepository.findOne({
      where,
      relations: ['roles'],
    });
  }

  async getTradeHistory(
    uuid: string,
    page: number,
    limit: number,
  ): Promise<IPageResponse<TradeHistory>> {
    const [trades, total] = [[], 0];
    // await this.tradeHistoryRepository.findAndCountBy({
    //   user: {
    //     uuid: uuid,
    //   },
    // });

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

  async getBriefStats(uuid: string) {
    const [trades, totalTrades] = [[], 0];
    // await this.tradeHistoryRepository.findAndCountBy({
    //   user: {
    //     uuid: uuid,
    //   },
    // });

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
}
