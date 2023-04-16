import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role, TradeHistory, User } from 'src/typeorm';
import { UsersController } from '../controllers';
import { TradingService, UsersService } from '../services';
import { MailService } from '../services/mail.service';
import { StrategyModule } from './strategy.module';
import { TradingModule } from './trading.module';
import { MailModule } from './mail.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    TypeOrmModule.forFeature([User, TradeHistory, Role]),
    StrategyModule,
    TradingModule,
    MailModule,
  ],
  exports: [UsersService],
})
export class UsersModule {}
