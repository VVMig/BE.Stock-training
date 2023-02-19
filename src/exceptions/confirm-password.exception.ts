import { BadRequestException } from '@nestjs/common';

export class ConfirmPasswordException extends BadRequestException {
  constructor(error?: string) {
    super('Passwords should be equel', error);
  }
}
