import { IsEmail } from 'class-validator';

export class PasswordResetEmailDTO {
  @IsEmail()
  email: string;
}
