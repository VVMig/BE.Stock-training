export interface IQueryPage {
  page: number;
  limit: number;
}

export enum SubscriptionInterval {
  '1h' = '1h',
  '3h' = '3h',
  '6h' = '6h',
  '9h' = '9h',
  '12h' = '12h',
}
