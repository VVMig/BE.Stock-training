import { Module } from '@nestjs/common';
import { StrategyService, TradingService, UsersService } from '../services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role, Strategy, TradeHistory, User } from 'src/typeorm';
import { StrategyController } from '../controllers';

@Module({
  controllers: [StrategyController],
  providers: [StrategyService],
  imports: [TypeOrmModule.forFeature([User, TradeHistory, Role, Strategy])],
  exports: [StrategyService],
})
export class StrategyModule {}
