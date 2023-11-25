import { Injectable } from '@nestjs/common'
import { ICandle } from '@trading/dto/candle.dto'
import { IBollingerBands, IBollingerBandSignal } from '@technical-analysis/indicators/bollingerBands/bollingerBands.types'
import { SIGNAL_DIRECTION, SIGNALS } from '@technical-analysis/signals/signals.types'
import { TechnicalIndicators } from '@technical-analysis/technicalAnalysis.types'
import { INTERVALS } from '@exchanges/constants/candlesticks.types'

@Injectable()
export class BollingerBandsIndicator {
  calculateBollingerBands(data: ICandle[], period: number = 20, multiplier: number = 2): IBollingerBands | null {
    if (data.length < period) {
      return null
    }

    const smaArray = this.calculateSMA(data, period)
    const stdDevArray = this.calculateStandardDeviation(data, smaArray, period)

    const middleBand = smaArray[smaArray.length - 1]
    const upperBand = middleBand + multiplier * stdDevArray[stdDevArray.length - 1]
    const lowerBand = middleBand - multiplier * stdDevArray[stdDevArray.length - 1]

    return {
      upperBand,
      middleBand,
      lowerBand
    }
  }

  detectBollingerCrossover(interval: string, data: ICandle[], period: number = 20, multiplier: number = 2): IBollingerBandSignal | null {
    if (data.length < period + 1) {
      // Ensure there is enough data to check for a crossover
      return null
    }

    const { upperBand: currentUpper, lowerBand: currentLower } = this.calculateBollingerBands(data, period, multiplier)
    const { upperBand: previousUpper, lowerBand: previousLower } = this.calculateBollingerBands(data.slice(0, -1), period, multiplier)

    const currentClose = data[data.length - 1].close
    const previousClose = data[data.length - 2].close

    if (previousClose <= previousUpper && currentClose > currentUpper) {
      return {
        indicator: TechnicalIndicators.BOLLINGER_BANDS,
        type: SIGNALS.TRIGGER_POINT,
        direction: SIGNAL_DIRECTION.BULLISH,
        intervals: [interval as INTERVALS],
        upperBand: currentUpper,
        lowerBand: currentLower
      }
    } else if (previousClose >= previousLower && currentClose < currentLower) {
      return {
        indicator: TechnicalIndicators.BOLLINGER_BANDS,
        type: SIGNALS.TRIGGER_POINT,
        direction: SIGNAL_DIRECTION.BEARISH,
        intervals: [interval as INTERVALS],
        upperBand: currentUpper,
        lowerBand: currentLower
      }
    }

    return null
  }

  private calculateSMA(data: ICandle[], period: number): number[] {
    const smaArray = []
    for (let i = 0; i <= data.length - period; i++) {
      const slice = data.slice(i, i + period)
      const sum = slice.reduce((acc, candle) => acc + candle.close, 0)
      smaArray.push(sum / period)
    }
    return smaArray
  }

  private calculateStandardDeviation(data: ICandle[], smaArray: number[], period: number): number[] {
    const stdDevArray = []
    for (let i = 0; i < smaArray.length; i++) {
      const slice = data.slice(i, i + period)
      const variance = slice.reduce((acc, candle) => acc + Math.pow(candle.close - smaArray[i], 2), 0) / period
      stdDevArray.push(Math.sqrt(variance))
    }
    return stdDevArray
  }
}
