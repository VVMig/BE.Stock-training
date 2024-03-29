import { Module } from '@nestjs/common';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../services/app.service';
import { TradingModule } from '.';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from 'src/typeorm';
import { UsersModule } from './users.module';
import { AuthModule } from './auth.module';
import { AuthSubscriber } from 'src/subscribers/auth.subscriber';
import { MailerModule } from '@nestjs-modules/mailer';
import { ScheduleModule } from '@nestjs/schedule';
import * as fs from 'fs';
import { StrategyModule } from './strategy.module';
import { CsvModule } from './csv.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    TradingModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    StrategyModule,
    CsvModule,
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        service: 'gmail',
        secure: false,
        auth: (configService: ConfigService) => ({
          user: configService.get('MAIL_USER'),
          pass: configService.get('MAIL_PASSWORD'),
        }),
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: +configService.get<number>('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_NAME'),
          ssl:
            process.env.ENV !== 'development'
              ? {
                  ca: fs.readFileSync(process.env.SSL_CA_CERTIFICATES),
                }
              : undefined,
          entities: entities,
          synchronize: true,
          subscribers: [AuthSubscriber],
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
