import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CRYPTOCURRENCY_SHORT } from 'src/constants/Currency';
import { confirmEmailHTMLTemplate } from 'src/templates/confirmEmail';
import { emailSubscriptionHTMLTemplate } from 'src/templates/emailSubscription';
import { passwordResetHTMLTemplate } from 'src/templates/passwordReset';
import { User } from 'src/typeorm';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendUserConfirmation(user: User, token: string) {
    const url = `${this.configService.get(
      'BACKEND_URL',
    )}/api/v1/auth/verify/${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to TraneTrade! Confirm your Email',
      html: confirmEmailHTMLTemplate(user.name, url),
    });
  }

  async sendEmailPricesSubscription(
    user: User,
    prices: { symbol: CRYPTOCURRENCY_SHORT; price: number }[],
  ) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Cryptocurrencies prices',
      html: emailSubscriptionHTMLTemplate(prices),
    });
  }

  async sendResetPasswordEmail(email: string, token: string) {
    const url = `${this.configService.get(
      'CLIENT_PASSWORD_RESET_URL',
    )}${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password reset',
      html: passwordResetHTMLTemplate(url),
    });
  }
}
