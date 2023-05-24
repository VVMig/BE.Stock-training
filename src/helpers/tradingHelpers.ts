import * as moment from 'moment';
import { TIMEFRAMES } from 'src/constants/Timeframes';
import { IKlineResponse, IStockData } from 'src/interfaces';
import { TradeHistory } from 'src/typeorm';

export const getStartDate = (date: Date, timeframe: string | number) => {
  const checkedDate =
    timeframe === TIMEFRAMES.DAY
      ? moment(date).subtract(1, 'days').toDate()
      : date;

  const formattedDate = {
    [TIMEFRAMES.DAY]: moment(checkedDate).subtract(200, 'days').valueOf(),
    [TIMEFRAMES['1_MIN']]: moment(checkedDate)
      .subtract(200, 'minutes')
      .valueOf(),
    [TIMEFRAMES['5_MIN']]: moment(checkedDate)
      .subtract(200 * 5, 'minutes')
      .valueOf(),
    [TIMEFRAMES['1_HOURS']]: moment(checkedDate)
      .subtract(200, 'hours')
      .valueOf(),
    [TIMEFRAMES['15_MIN']]: moment(checkedDate)
      .subtract(200 * 15, 'minutes')
      .valueOf(),
    [TIMEFRAMES['30_MIN']]: moment(checkedDate)
      .subtract(200 * 30, 'minutes')
      .valueOf(),
  };

  return formattedDate[timeframe];
};

export const getEndDate = (date: Date, timeframe: string | number) => {
  const checkedDate =
    timeframe === TIMEFRAMES.DAY ? moment(date).add(1, 'days').toDate() : date;

  const formattedDate = {
    [TIMEFRAMES.DAY]: moment(checkedDate).add(200, 'days').valueOf(),
    [TIMEFRAMES['1_MIN']]: moment(checkedDate).add(200, 'minutes').valueOf(),
    [TIMEFRAMES['5_MIN']]: moment(checkedDate)
      .add(200 * 5, 'minutes')
      .valueOf(),
    [TIMEFRAMES['1_HOURS']]: moment(checkedDate).add(200, 'hours').valueOf(),
    [TIMEFRAMES['15_MIN']]: moment(checkedDate)
      .add(200 * 15, 'minutes')
      .valueOf(),
    [TIMEFRAMES['30_MIN']]: moment(checkedDate)
      .add(200 * 30, 'minutes')
      .valueOf(),
  };

  if (moment(formattedDate[timeframe]).isAfter(moment())) {
    return moment().valueOf();
  }

  return formattedDate[timeframe];
};

export const mappedRequestData = (data: number[]): IStockData[] =>
  data
    ?.map((info) => ({
      time: +info[0] / 1000,
      open: +info[1],
      high: +info[2],
      low: +info[3],
      close: +info[4],
      volume: +info[5],
    }))
    .sort((a, b) => a.time - b.time) || [];

export function calculateProfit(trade: TradeHistory) {
  const isLong = trade.tradeState === 'LONG';
  const profit = isLong
    ? trade.closeBet - trade.initialBet
    : trade.initialBet - trade.closeBet;
  const profitPercent = (profit / trade.initialBet) * 100;
  const totalProfitPercent = isLong ? profitPercent : profitPercent;

  return +(totalProfitPercent * trade.margin).toFixed(2);
}
