import { IsNotEmpty, MinLength } from 'class-validator';

export class PasswordResetDTO {
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  token: string;
}
