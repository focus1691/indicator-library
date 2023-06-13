export enum BINANCE_FUTURES_CONTRACTS {
  PERPETUAL = 'PERPETUAL',
  QUARTER = 'CURRENT_QUARTER'
}

export interface TimeDescription {
  duration: any
  amount: any
}

export enum KlineIntervals {
  FIVE_MINS = '5m',
  FIFTHTEEN_MINS = '15m',
  THIRTY_MINS = '30m',
  ONE_HOUR = '1h',
  TWO_HOURS = '2h',
  FOUR_HOURS = '4h',
  SIX_HOURS = '6h',
  TWELVE_HOURS = '12h',
  ONE_DAY = '1d',
  ONE_WEEK = '1w',
  ONE_MONTH = '1M'
}

export enum OpenInterestIntervals {
  FIVE_MINS = '5m',
  FIFTHTEEN_MINS = '15m',
  THIRTY_MINS = '30m',
  ONE_HOUR = '1h',
  TWO_HOURS = '2h',
  FOUR_HOURS = '4h',
  SIX_HOURS = '6h',
  TWELVE_HOURS = '12h',
  ONE_DAY = '1d'
}

export const KlineIntervalTimes: Record<KlineIntervals, TimeDescription> = {
  [KlineIntervals.FIVE_MINS]: { duration: 'minutes', amount: 5 },
  [KlineIntervals.FIFTHTEEN_MINS]: { duration: 'minutes', amount: 15 },
  [KlineIntervals.THIRTY_MINS]: { duration: 'minutes', amount: 30 },
  [KlineIntervals.ONE_HOUR]: { duration: 'h', amount: 1 },
  [KlineIntervals.TWO_HOURS]: { duration: 'h', amount: 2 },
  [KlineIntervals.FOUR_HOURS]: { duration: 'h', amount: 4 },
  [KlineIntervals.SIX_HOURS]: { duration: 'h', amount: 6 },
  [KlineIntervals.TWELVE_HOURS]: { duration: 'h', amount: 12 },
  [KlineIntervals.ONE_DAY]: { duration: 'd', amount: 1 },
  [KlineIntervals.ONE_WEEK]: { duration: 'week', amount: 1 },
  [KlineIntervals.ONE_MONTH]: { duration: 'month', amount: 1 }
}

export const OpenInterestIntervalTimes: Record<OpenInterestIntervals, TimeDescription> = {
  [OpenInterestIntervals.FIVE_MINS]: { duration: 'minutes', amount: 5 },
  [OpenInterestIntervals.FIFTHTEEN_MINS]: { duration: 'minutes', amount: 15 },
  [OpenInterestIntervals.THIRTY_MINS]: { duration: 'minutes', amount: 30 },
  [OpenInterestIntervals.ONE_HOUR]: { duration: 'h', amount: 1 },
  [OpenInterestIntervals.TWO_HOURS]: { duration: 'h', amount: 2 },
  [OpenInterestIntervals.FOUR_HOURS]: { duration: 'h', amount: 4 },
  [OpenInterestIntervals.SIX_HOURS]: { duration: 'h', amount: 6 },
  [OpenInterestIntervals.TWELVE_HOURS]: { duration: 'h', amount: 12 },
  [OpenInterestIntervals.ONE_DAY]: { duration: 'd', amount: 1 }
}
