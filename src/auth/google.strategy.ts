import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  client: OAuth2Client;

  constructor() {
    super();

    this.client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );
  }

  async validate(req: Request<any, any, { token: string }>): Promise<any> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: req.body.token,
        audience: this.client._clientId,
      });

      if (!ticket) {
        throw new HttpException('Something went wrong', HttpStatus.BAD_REQUEST);
      }

      return ticket.getPayload();
    } catch (error) {
      throw new HttpException('Something went wrong', HttpStatus.BAD_REQUEST);
    }
  }
}
