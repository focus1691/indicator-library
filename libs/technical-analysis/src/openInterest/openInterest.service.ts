import { Inject, Injectable } from '@nestjs/common'
import { IOpenInterestCandle } from '@trading/dto/candle.dto'
import { INTERVALS } from '@exchanges/constants/candlesticks.types'
import { PeakDetector } from '@technical-analysis/peakDetector/peakDetector.service'
import { IPeakSignal } from '@technical-analysis/peakDetector/peakDetector.types'
import { IPeak } from '@technical-analysis/range/range.types'
import { SIGNAL_DIRECTION, SIGNALS } from '@technical-analysis/signals/signals.types'
import { TechnicalIndicators } from '@technical-analysis/technicalAnalysis.types'

@Injectable()
export class OpenInterestService {
  public static LAG: number = 2 // Fast adaption for sudden changes
  public static THRESHOLD: number = 3 // 3 standard deviation from the Moving Mean for significance
  public static INFLUENCE: number = 1 // Open Interest is non-stationary

  constructor(@Inject('PeakDetector') private peakDetector: PeakDetector) {}

  private findPeakSignals(data: IOpenInterestCandle[]): IPeak[] {
    const values = data.map((value) => value.openInterest)
    const signals: IPeak[][] = this.peakDetector.findSignals(values)
    const flattenedSignals: IPeak[] = signals.map((group) => group[0]) // (-1, -1, 1, 1, -1, -1) becomes -1, 1, -1

    return flattenedSignals
  }

  public findLatestMarketSentiment(interval: string, data: IOpenInterestCandle[]): IPeakSignal {
    const signals: IPeak[] = this.findPeakSignals(data)
    const lastSignal: IPeak = signals?.[signals.length - 1]

    if (lastSignal) {
      const peakSignal: IPeakSignal = {
        indicator: TechnicalIndicators.OPEN_INTEREST_SENTIMENT,
        type: SIGNALS.MARKET_SENTIMENT,
        direction: lastSignal.direction === 1 ? SIGNAL_DIRECTION.BULLISH : SIGNAL_DIRECTION.BEARISH,
        intervals: [interval as INTERVALS],
        signalTime: new Date(Number(data[lastSignal.position].timestamp))
      }
      return peakSignal
    }
    return null
  }
}
