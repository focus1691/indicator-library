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
  MARKET_PROFILE = 'marketProfile',
  NPOC = 'npoc',
  RANGES = 'ranges',
  OPEN_INTEREST_EMAS = 'oiEmas',
  EMA = 'ema',
  VWAP = 'vwap',
  LINEAR_REGRESSION = 'linearRegression',
  HARMONICS = 'harmonics'
}
