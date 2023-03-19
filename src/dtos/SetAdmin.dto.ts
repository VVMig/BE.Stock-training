import { IsBoolean, IsNotEmpty } from 'class-validator';

export class SetAdminDTO {
  @IsNotEmpty()
  userUuid: string;

  @IsNotEmpty()
  @IsBoolean()
  admin: boolean;
}
