import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role, TradeHistory, User } from 'src/typeorm';
import { UsersController } from '../controllers';
import { TradingService, UsersService } from '../services';
import { MailService } from '../services/mail.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, TradingService, MailService],
  imports: [TypeOrmModule.forFeature([User, TradeHistory, Role])],
  exports: [UsersService],
})
export class UsersModule {}
