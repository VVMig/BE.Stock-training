import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { MailService } from '../services/mail.service';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      // transport: 'smtps://user@example.com:topsecret@smtp.example.com',
      // or
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          service: 'gmail',
          secure: false,
          auth: {
            user: configService.get('MAIL_USER'),
            pass: configService.get('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: 'TraneTrade',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService], // 👈 export for DI
})
export class MailModule {}
