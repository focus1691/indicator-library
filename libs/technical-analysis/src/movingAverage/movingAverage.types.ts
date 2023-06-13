import { RELATIVE_POSITION } from '@technical-analysis/technicalAnalysis.types'

export enum MA_Periods {
  THREE = 3,
  FIVE = 5,
  SEVEN = 7,
  TEN = 10,
  TWENTY = 20,
  THIRTY = 30,
  FIFTY = 50,
  ONE_HUNDRED = 100,
  TWO_HUNDRED = 200
}

export interface IPriceMA {
  position: RELATIVE_POSITION
  period: MA_Periods
  value: number
  interval: string
}

export interface IEmaOutcome {
  [period: string]: number
}
