import { EmaCrossingResult, MA_Periods } from '@technical-analysis/indicators/movingAverage/movingAverage.types'
import { EmaIndicator } from '@technical-analysis/indicators/movingAverage/ema'
import { ICandle } from '@trading/dto/candle.dto'
import { Injectable } from '@nestjs/common'
import { SIGNAL_DIRECTION, SIGNALS } from '@technical-analysis/signals/signals.types'
import { TechnicalIndicators } from '@technical-analysis/technicalAnalysis.types'
import { INTERVALS } from '@exchanges/constants/candlesticks.types'

@Injectable()
export class EmaCrossingIndicator {
  constructor(private readonly emaIndicator: EmaIndicator) {}

  public detectCrossing(interval: string, data: ICandle[], shortPeriod: MA_Periods, longPeriod: MA_Periods): EmaCrossingResult | null {
    // Ensure we have enough data to prsoceed
    if (data.length < longPeriod + 1) {
      return null
    }

    // Extract the closing prices from the candlestick data
    const closePrices = data.map((row) => row.close)

    // Calculate the EMA values for the chosen short and long periods
    const shortEmaValues = EmaIndicator.calculateEMA([...closePrices], shortPeriod)
    const longEmaValues = EmaIndicator.calculateEMA([...closePrices], longPeriod)

    // Define variables to hold the time and type of the most recent crossing
    let mostRecentCrossingTime: Date | null = null
    let mostRecentCrossingSignal: SIGNAL_DIRECTION | null = null

    // Start from the most recent data and move backward to find the most recent crossing
    for (let i = shortEmaValues.length - 1; i >= longPeriod; i--) {
      const currentShortEma = shortEmaValues[i]
      const currentLongEma = longEmaValues[i]
      const prevShortEma = shortEmaValues[i - 1]
      const prevLongEma = longEmaValues[i - 1]

      if (currentShortEma > currentLongEma && prevShortEma <= prevLongEma) {
        mostRecentCrossingSignal = SIGNAL_DIRECTION.BULLISH
        mostRecentCrossingTime = new Date(data[i].closeTime)
        break // Exit the loop as we've found the most recent crossing
      }

      if (currentShortEma < currentLongEma && prevShortEma >= prevLongEma) {
        mostRecentCrossingSignal = SIGNAL_DIRECTION.BEARISH
        mostRecentCrossingTime = data[i].closeTime
        break // Exit the loop as we've found the most recent crossing
      }
    }

    // If a crossing was found, return the details
    if (mostRecentCrossingTime && mostRecentCrossingSignal) {
      return {
        indicator: TechnicalIndicators.EMA_CROSSING,
        type: SIGNALS.TRIGGER_POINT,
        direction: mostRecentCrossingSignal,
        time: mostRecentCrossingTime,
        shortPeriod,
        longPeriod,
        intervals: [interval as INTERVALS]
      }
    }

    return null // No crossing was found
  }
}
