import { ISignal } from '@technical-analysis/signals/signals.types'

export interface PivotPointData extends ISignal {
  pivot: number
  support1: number
  resistance1: number
  support2: number
  resistance2: number
}
