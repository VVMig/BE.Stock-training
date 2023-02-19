import { BadRequestException } from '@nestjs/common';

export class UserNotFoundException extends BadRequestException {
  constructor(error?: string) {
    super('User with this id was not found', error);
  }
}
