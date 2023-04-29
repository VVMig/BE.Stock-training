import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AccessTokenStrategy } from 'src/auth/access-token.strategy';
import { GoogleStrategy } from 'src/auth/google.strategy';
import { LocalStrategy } from 'src/auth/local.strategy';
import { RefreshTokenStrategy } from 'src/auth/refresh-token.strategy';
import { AuthController } from '../controllers';
import { AuthService } from '../services';
import { MailModule } from './mail.module';
import { UsersModule } from './users.module';
import { CsvService } from '../services/csv.sevice';

@Module({
  imports: [],
  providers: [CsvService],
  controllers: [],
  exports: [CsvService],
})
export class CsvModule {}
