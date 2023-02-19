import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role, TradeHistory, User } from 'src/typeorm';
import { UsersController } from '../controllers';
import { UsersService } from '../services';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [TypeOrmModule.forFeature([User, TradeHistory, Role])],
  exports: [UsersService],
})
export class UsersModule {}
