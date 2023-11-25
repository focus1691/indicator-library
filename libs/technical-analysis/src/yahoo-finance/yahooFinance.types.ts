export enum STOCK_SYMBOLS {
  SPX = '^GSPC',
  DOW_JONES = '^DJI',
  NASDAQ = '^IXIC',
  DXY = 'DX-Y.NYB',
  GOLD = 'GC=F',
  FTSE = '^FTSE'
}

export enum STOCKS {
  SPX = 'spx',
  DOW_JONES = 'dow',
  NASDAQ = 'ndx',
  DXY = 'dxy',
  GOLD = 'gold',
  FTSE = 'ftse'
}

export enum RANGES {
  ONE_DAY = '1d',
  FIVE_DAYS = '5d',
  ONE_MONTH = '1mo',
  THREE_MONTHS = '3mo',
  SIX_MONTHS = '6mo',
  ONE_YEAR = '1y',
  TWO_YEARS = '2y',
  FIVE_YEARS = '5y',
  TEN_YEARS = '10y',
  MAXIMIUM = 'max'
}

export enum INTERVALS {
  ONE_MINUTE = '1m',
  TWO_MINUTES = '2m',
  FIVE_MINUTES = '5m',
  FIFTEEN_MINUTES = '15m',
  THIRTY_MINUTES = '30m',
  ONE_HOUR = '60m',
  ONE_DAY = '1d',
  ONE_WEEK = '1wk',
  ONE_MONTH = '1mo'
}

export interface ILinearRegressionOverview {
  [STOCKS.SPX]: number | string,
  [STOCKS.DOW_JONES]: number | string,
  [STOCKS.FTSE]: number | string,
  [STOCKS.NASDAQ]: number | string,
  [STOCKS.DXY]: number | string,
  [STOCKS.GOLD]: number | string
}
