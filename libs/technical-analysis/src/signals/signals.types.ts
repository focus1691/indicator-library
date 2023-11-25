import { INTERVALS } from '@exchanges/constants/candlesticks.types'
import { CANDLE_OBSERVATIONS } from '@technical-analysis/marketProfile/marketProfile.types'
import { TechnicalIndicators } from '@technical-analysis/technicalAnalysis.types'

export interface ISignal {
  indicator: TechnicalIndicators | CANDLE_OBSERVATIONS
  type: SIGNALS
  direction: SIGNAL_DIRECTION
  intervals: INTERVALS[]
}

export enum SIGNALS {
  TRIGGER_POINT = 'trigger_point',
  MARKET_SENTIMENT = 'market_sentiment',
  CANDLE_ANOMALY = 'candle_anomaly',
  POTENTIAL_ROTATION = 'potential_rotation',
  VALUE_AREA_CONTEXT = 'value_area_context',
}

export enum SIGNAL_DIRECTION {
  BULLISH = 'bullish',
  BEARISH = 'bearish',
  SIDEWAYS = 'sideways',
  BOTH = 'both',
  NONE = 'none'
}
