import { Module } from '@nestjs/common';
import { TradingService, UsersService } from '../services';
import { TradingController } from '../controllers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role, TradeHistory, User } from 'src/typeorm';
import { StrategyModule } from './strategy.module';
import { CsvModule } from './csv.module';

@Module({
  controllers: [TradingController],
  providers: [TradingService],
  imports: [
    TypeOrmModule.forFeature([User, TradeHistory, Role]),
    StrategyModule,
    CsvModule,
  ],
  exports: [TradingService],
})
export class TradingModule {}
