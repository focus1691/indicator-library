import { RELATIVE_POSITION, LEVEL_TYPE } from '@technical-analysis/technicalAnalysis.types'
import { VALUE_AREA, VALUE_AREA_PERIODS, VALUE_AREA_TENSE, IValueArea } from '@technical-analysis/valueArea/valueArea.types'

export interface IMarketProfile {
  startOfPeriod: number
  valueArea?: IValueArea
  IB?: IInitialBalance
  failedAuction?: IMarketProfileObservation[]
  excess?: IMarketProfileObservation[]
  poorHighLow?: IMarketProfileObservation[]
  singlePrints?: IMarketProfileObservation[]
  ledges?: IMarketProfileObservation[]
  openType?: MARKET_PROFILE_OPEN_TYPES
  dayType?: MARKET_PROFILE_DAY_TYPES
}

export interface IMarketProfileObservation {
  period?: string
  direction?: 1 | -1
}

export interface IInitialBalance {
  high: number
  low: number
}

export interface IValueAreaSymbols {
  [symbol: string]: {
    [period in VALUE_AREA_PERIODS]?: IValueArea
  }
}

export interface ITrendCharacteristics {
  period: VALUE_AREA_PERIODS
  position: RELATIVE_POSITION
}

export interface IPriceLevelInformation {
  price: number
  level?: VALUE_AREA
  levelType: LEVEL_TYPE
  period: VALUE_AREA_PERIODS
  tense: VALUE_AREA_TENSE
}

export interface IPriceLevels {
  support?: IPriceLevelInformation
  resistance?: IPriceLevelInformation
}

export enum MARKET_PROFILE_FINDINGS {
  EXCESS = 'excess',
  SINGLE_PRINT = 'single_print',
  FAILED_AUCTION = 'failed_auction',
  POOR_HIGH_LOW = 'poor_high_low',
  LEDGES = 'ledges'
}

export enum MARKET_PROFILE_OPEN_TYPES {
  OPEN_DRIVE = 'Open Drive',
  OPEN_TEST_DRIVE = 'Open Test Drive',
  OPEN_REJECTION_REVERSE = 'Open Rejection Reverse',
  OPEN_AUCTION = 'Open Auction'
}

export enum MARKET_PROFILE_DAY_TYPES {
  NORMAL = 'normal',
  NEUTRAL = 'neutral',
  TREND = 'trend',
  DOUBLE_DISTRIBUTION = 'double_distribution',
  B_SHAPE = 'b_shape',
  P_SHAPE = 'p_shape'
}
