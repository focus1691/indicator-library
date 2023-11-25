import { Exchange, EXCHANGE_DATA_TYPES } from '@exchanges/constants/exchanges'

interface IExchangeDataTypes {
  [key: string]: {
    [EXCHANGE_DATA_TYPES.KLINES]: IKlineExchangeKey,
    [EXCHANGE_DATA_TYPES.OPEN_INTEREST]?: IOpenInterestExchangeKey
    [EXCHANGE_DATA_TYPES.FUNDING_RATE]?: IFundingRateExchangeKey
  }
}

export interface IKlineExchangeKey {
  time: string | number
  open: string | number
  high: string | number
  close: string | number
  low: string | number
  volume: string | number
  turnover?: string | number
}

export interface IOpenInterestExchangeKey {
  time: string | number
  openInterest: string | number
}

export interface IFundingRateExchangeKey {
  time: string | number
  fundingRate: string | number
}

export const DataTypeExchangeKeys: IExchangeDataTypes = Object.freeze({
  [Exchange.BYBIT]: {
    [EXCHANGE_DATA_TYPES.KLINES]: {
      time: 0,
      open: 1,
      high: 2,
      low: 3,
      close: 4,
      volume: 5,
      turnover: 6
    },
    [EXCHANGE_DATA_TYPES.OPEN_INTEREST]: {
      openInterest: 'openInterest',
      time: 'timestamp'
    },
    [EXCHANGE_DATA_TYPES.FUNDING_RATE]: {
      fundingRate: 'fundingRate',
      time: 'fundingRateTimestamp'
    }
  },
  [Exchange.BINANCE]: {
    [EXCHANGE_DATA_TYPES.KLINES]: {
      time: 0,
      open: 1,
      high: 2,
      low: 3,
      close: 4,
      volume: 5
    },
    [EXCHANGE_DATA_TYPES.OPEN_INTEREST]: {
      openInterest: 'sumOpenInterest',
      time: 'timestamp'
    },
    [EXCHANGE_DATA_TYPES.FUNDING_RATE]: {
      fundingRate: 'fundingRate',
      time: 'fundingTime'
    }
  },
  [Exchange.BITMEX]: {
    [EXCHANGE_DATA_TYPES.KLINES]: {
      time: 'timestamp',
      open: 'open',
      high: 'high',
      close: 'close',
      low: 'low',
      volume: 'volume'
    }
  }
})
