import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Roles } from 'src/constants/Roles';
import { CreateUserDto } from 'src/dtos/CreateUser.dto';
import { TradingResultDto } from 'src/dtos/TradingResult.dto';
import { UserNotFoundException } from 'src/exceptions/user-not-found.exception';
import { IPageResponse } from 'src/interfaces';
import { Role, TradeHistory, User } from 'src/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(TradeHistory)
    private readonly tradeHistoryRepository: Repository<TradeHistory>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}

  getUsers() {
    return this.userRepository.find();
  }

  async createUser(createUserDto: CreateUserDto) {
    const newUser = this.userRepository.create(createUserDto);
    const role = await this.roleRepository.findOneBy({
      name: Roles.USER,
    });

    newUser.roles = [role];

    return this.userRepository.save(newUser);
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
    const [trades, total] = await this.tradeHistoryRepository.findAndCountBy({
      user: {
        uuid: uuid,
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
