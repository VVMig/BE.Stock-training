export interface IKlineQuery {
  symbol: string;
  interval: string | number;
  date: number;
}

export type TradeState = 'LONG' | 'SHORT';

export interface IKlineResponse {
  result: {
    list: number[];
  };
}

export interface IFutureQuery {
  date: number;
  symbol: string;
  interval: string | number;
}

export interface IStockData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ITradingData {
  endDate: number;
  startDate: number;
  data: IStockData[];
}
