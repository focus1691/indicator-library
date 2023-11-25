export enum LEVEL_TYPE {
  SUPPORT = 'support',
  RESISTANCE = 'resistance'
}

export enum RELATIVE_POSITION {
  ABOVE = 'above',
  BELOW = 'below'
}

export enum KEY_PRICES {
  PREVIOUS_DAY_CLOSE = 'pdClose',
  DAILY_OPEN = 'dOpen',
  WEEKLY_OPEN = 'wOpen',
  MONTHLY_OPEN = 'mOpen'
}

export const TECHNICAL_ANALYSIS = 'ta'

export enum TechnicalIndicators {
  RANGES = 'ranges',
  EMA = 'ema',
  EMA_CROSSING = 'emaCrossing',
  BOLLINGER_BANDS = 'bollingerBands',
  PIVOT_POINTS = 'pivotPoints',
  VWAP = 'vwap',
  LINEAR_REGRESSION = 'linearRegression',
  HARMONICS = 'harmonics',
  OPEN_INTEREST_SENTIMENT = 'openInterestSentiment',
  FUNDING_RATE_SENTIMENT = 'fundingRateSentiment'
}
