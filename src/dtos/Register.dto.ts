import { IsEmail } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  name: string;
  password: string;
  confirmPassword: string;
}
