import { INTERVALS } from '@exchanges/constants/candlesticks.types'
import { Exchange } from '@exchanges/constants/exchanges'

export const normaliseInterval = (interval: string): string => {
  switch (interval) {
    case '1':
      return INTERVALS.ONE_MINUTE
    case '3':
      return INTERVALS.THREE_MINUTES
    case '5':
      return INTERVALS.FIVE_MINUTES
    case '15':
      return INTERVALS.FIFTEEN_MINUTES
    case '30':
      return INTERVALS.THIRTY_MINUTES
    case '60':
      return INTERVALS.ONE_HOUR
    case '120':
      return INTERVALS.TWO_HOURS
    case '240':
      return INTERVALS.FOUR_HOURS
    case '360':
      return INTERVALS.SIX_HOURS
    case '720':
      return INTERVALS.TWELVE_HOURS
    case 'D':
      return INTERVALS.ONE_DAY
    case 'W':
      return INTERVALS.ONE_WEEK
    case 'M':
      return INTERVALS.ONE_MONTH
    default:
      return interval
  }
}

export const normaliseExchangePair = (pair?: string, exchange?: Exchange): string | undefined => {
  if (!pair || !exchange) return undefined
  if (exchange === Exchange.BITMEX && pair === 'BTCUSDT') return 'XBTUSDT'
  return pair
}
