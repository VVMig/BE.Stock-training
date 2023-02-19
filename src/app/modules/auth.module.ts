import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AccessTokenStrategy } from 'src/auth/access-token.strategy';
import { LocalStrategy } from 'src/auth/local.strategy';
import { RefreshTokenStrategy } from 'src/auth/refresh-token.strategy';
import { AuthController } from '../controllers';
import { AuthService } from '../services';
import { UsersModule } from './users.module';

@Module({
  imports: [UsersModule, PassportModule, JwtModule.register({})],
  providers: [
    AuthService,
    LocalStrategy,
    AccessTokenStrategy,
    RefreshTokenStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
