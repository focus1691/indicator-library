import { Exchange, EXCHANGE_DATA_TYPES } from '@utils/constants/exchanges'

interface IExchangeDataTypes {
  [key: string]: {
    [EXCHANGE_DATA_TYPES.KLINES]: IKlineExchangeKey,
    [EXCHANGE_DATA_TYPES.OPEN_INTEREST]?: IOpenInterestExchangeKey
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

export const DataTypeExchangeKeys: IExchangeDataTypes = {
  [Exchange.BYBIT_USDT_PERPETUAL]: {
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
    }
  },
  [Exchange.BINANCE_FUTURES]: {
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
}

Object.freeze(DataTypeExchangeKeys)
