export enum CRYPTOCURRENCY_FULL {
  BTC = 'Bitcoin',
  ETH = 'Ethereum',
  LTC = 'Litecoin',
  XRP = 'Ripple',
  ADA = 'Cardano',
  DOT = 'Polkadot',
  BNB = 'Binance Coin',
  XLM = 'Stellar',
}

export enum CRYPTOCURRENCY_SHORT {
  BTC = 'BTC',
  ETH = 'ETH',
  LTC = 'LTC',
  XRP = 'XRP',
  ADA = 'ADA',
  DOT = 'DOT',
  BNB = 'BNB',
  XLM = 'XLM',
}

export const currencyColorMap: Record<CRYPTOCURRENCY_SHORT, string> = {
  [CRYPTOCURRENCY_SHORT.BTC]: '#F7931A',
  [CRYPTOCURRENCY_SHORT.ETH]: '#627EEA',
  [CRYPTOCURRENCY_SHORT.LTC]: '#BFBBBB',
  [CRYPTOCURRENCY_SHORT.XRP]: '#22A5E7',
  [CRYPTOCURRENCY_SHORT.ADA]: '#3CC7C5',
  [CRYPTOCURRENCY_SHORT.DOT]: '#E6007A',
  [CRYPTOCURRENCY_SHORT.BNB]: '#F0B90B',
  [CRYPTOCURRENCY_SHORT.XLM]: '#08B5E5',
};
