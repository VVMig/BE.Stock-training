import { CRYPTOCURRENCY_SHORT } from 'src/constants/Currency';

export class TradingResultDto {
  initialBet: number;
  closeBet: number;
  currency: CRYPTOCURRENCY_SHORT;
  tradeState: string;
  margin: number;
}
