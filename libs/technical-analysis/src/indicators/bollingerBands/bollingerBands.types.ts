import { ISignal } from '@technical-analysis/signals/signals.types'

export interface IBollingerBands {
  upperBand: number
  middleBand: number
  lowerBand: number
}

export interface IBollingerBandSignal extends ISignal {
  upperBand: number,
  lowerBand: number
}
