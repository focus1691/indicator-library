import { Injectable } from '@nestjs/common'
import { ICandle } from '@trading/dto/candle.dto'
import { INTERVALS } from '@exchanges/constants/candlesticks.types'
import { PivotPointData } from '@technical-analysis/indicators/pivotPoints/pivotPoints.types'
import { SIGNAL_DIRECTION, SIGNALS } from '@technical-analysis/signals/signals.types'
import { TechnicalIndicators } from '@technical-analysis/technicalAnalysis.types'

@Injectable()
export class PivotPointsIndicator {
  calculatePivotPoints(interval: string, data: ICandle[]): PivotPointData {
    if (data.length === 0) {
      return null
    }

    let high = Number.MIN_SAFE_INTEGER
    let low = Number.MAX_SAFE_INTEGER
    const close = data[data.length - 1].close

    for (const row of data) {
      if (row.high > high) high = row.high
      if (row.low < low) low = row.low
    }

    const pivot = (high + low + close) / 3
    const range = high - low

    const support1 = 2 * pivot - high
    const support2 = pivot - range

    const resistance1 = 2 * pivot - low
    const resistance2 = pivot + range

    return {
      indicator: TechnicalIndicators.PIVOT_POINTS,
      type: SIGNALS.TRIGGER_POINT,
      direction: SIGNAL_DIRECTION.BOTH,
      intervals: [interval as INTERVALS],
      pivot,
      support1,
      resistance1,
      support2,
      resistance2
    }
  }
}
