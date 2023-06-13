
import { Inject, Injectable } from '@nestjs/common'
import { EmaIndicator } from '@technical-analysis/movingAverage/ema'
import { MA_Periods, IEmaOutcome } from '@technical-analysis/movingAverage/movingAverage.types'
import { PeakDetector } from '@technical-analysis/peakDetector/peakDetector.service'
import { IPeak, IPeakRange } from '@technical-analysis/range/range.types'
import { IOpenInterestExchangeKey } from '@utils/constants/dataTypeExchangeKeys'

@Injectable()
export class OpenInterestService {
  public static LAG: number = 5
  public static THRESHOLD: number = 2
  public static INFLUENCE: number = 0.3
  private emaPeriods: (MA_Periods)[] = [MA_Periods.THREE, MA_Periods.FIVE, MA_Periods.SEVEN, MA_Periods.TEN]

  constructor(private emaIndicator: EmaIndicator, @Inject('PeakDetector') private peakDetector: PeakDetector) {}

  public findPeaks(dataKey: IOpenInterestExchangeKey, data): IPeakRange[] {
    const values = data.map((value) => Number(value[dataKey.openInterest]))
    const timestamps: number[] = data.map((value) => value[dataKey.time])

    const groupedSignals: IPeak[][] = this.peakDetector.findSignals(values)
    const peakRanges: IPeakRange[] = this.peakDetector.getPeakRanges(groupedSignals, timestamps)
    return peakRanges
  }

  calculateEmas(dataKey: IOpenInterestExchangeKey, data): IEmaOutcome {
    return this.emaIndicator.calculateEmas(data.map(value => Number(value[dataKey.openInterest])), this.emaPeriods)
  }
}
