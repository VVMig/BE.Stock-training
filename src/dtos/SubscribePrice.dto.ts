import { IsNotEmpty, IsEnum, IsNumber } from 'class-validator';
import { SubscriptionInterval } from 'src/interfaces';

export class SubsribePriceDto {
  @IsNotEmpty()
  @IsEnum(SubscriptionInterval)
  interval: SubscriptionInterval;

  @IsNumber()
  time: number;

  @IsNotEmpty()
  type: 'time' | 'interval';
}
