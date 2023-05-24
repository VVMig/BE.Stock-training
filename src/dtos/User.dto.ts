import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateDateDTO {
  @IsNotEmpty()
  @IsNumber()
  startDate: number;

  @IsNotEmpty()
  @IsNumber()
  endDate: number;

  @IsString()
  description: string;
}
