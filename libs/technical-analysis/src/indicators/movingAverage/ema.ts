import { Injectable } from '@nestjs/common'
import { countDecimals, round } from '@technical-analysis/utils/math'
import { MA_Periods, IEmaOutcome } from './movingAverage.types'

@Injectable()
export class EmaIndicator {
  private periods: MA_Periods[] = [MA_Periods.NINE, MA_Periods.TWENTY_ONE, MA_Periods.FIFTY, MA_Periods.ONE_HUNDRED, MA_Periods.TWO_HUNDRED]
  public static calculateEMA(data, period: MA_Periods): number[] {
    const numDecimals: number = data.reduce((highestNumDecimals, ema) => {
      const numDecimals: number = countDecimals(Number(ema))
      return numDecimals > highestNumDecimals ? numDecimals : highestNumDecimals
    }, 0)
    const emas: number[] = [Number(data.shift())]
    const smoothingFactor: number = 2 / (period + 1)

    for (let i = 0; i < data.length; i++) {
      const prevEma: number = emas[emas.length - 1]
      const value: number = Number(data[i])
      const ema: number = smoothingFactor * (value - prevEma) + prevEma
      const roundedEma: number = round(ema, numDecimals)
      emas.push(roundedEma)
    }
    return emas
  }
  calculateEmas(data: number[], periods: number[] = this.periods): IEmaOutcome {
    const emaOutcome: IEmaOutcome = {} as IEmaOutcome

    for (let i = 0; i < periods.length; i++) {
      emaOutcome[periods[i]] = EmaIndicator.calculateEMA(data, periods[i])?.pop()
    }
    return emaOutcome
  }
}
