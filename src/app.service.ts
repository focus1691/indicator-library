import { Injectable, Logger } from '@nestjs/common'
import { INTERVALS, TIME_PERIODS } from '@exchanges/constants/candlesticks.types'
import { Exchange } from '@exchanges/constants/exchanges'
import { ISymbols } from '@exchanges/exchanges.types'
import { IBollingerBandSignal } from '@technical-analysis/indicators/bollingerBands/bollingerBands.types'
import { EmaCrossingMultiResult } from '@technical-analysis/indicators/movingAverage/movingAverage.types'
import { PivotPointData } from '@technical-analysis/indicators/pivotPoints/pivotPoints.types'
import { IMarketProfile } from '@technical-analysis/marketProfile/marketProfile.types'
import { ISignal } from '@technical-analysis/signals/signals.types'
import { TechnicalAnalysisService } from '@technical-analysis/technical-analysis.service'
import { ICandle } from '@trading/dto/candle.dto'

@Injectable()
export class AppService {
  private logger: Logger
  constructor(private readonly technicalAnalysisService: TechnicalAnalysisService) {}

  private calculateEmaCrossing(symbol: string, interval: INTERVALS, exchange: Exchange, candles: ICandle[]) {
    const emaCrossingMultiResult: EmaCrossingMultiResult = this.technicalAnalysisService.calcEmaCrossing(interval, candles)
    this.logger.log(emaCrossingMultiResult)
    try {
    } catch (error) {
      this.logger.error(`Error calculating EMA Crossing Signal for ${symbol} on ${exchange}`, error)
    }
  }

  private calcBollingerCrossover(symbol: string, interval: INTERVALS, exchange: Exchange, candles: ICandle[]) {
    try {
      const bollingerSignal: IBollingerBandSignal | null = this.technicalAnalysisService.calcBollingerCrossover(interval, candles)
      this.logger.log(bollingerSignal)
    } catch (error) {
      this.logger.error(`Error calculating Bollinger Crossover Signal for ${symbol} on ${exchange}`, error)
    }
  }

  private async calculatePivotPoints(symbol: string, interval: INTERVALS, exchange: Exchange, candles: ICandle[]) {
    try {
      const pivotPoints: PivotPointData = this.technicalAnalysisService.calcPivotPoints(interval, candles)
      this.logger.log(pivotPoints)
    } catch (error) {
      this.logger.error(`Error calculating Pivot Points for ${symbol} on ${exchange}`, error)
    }
  }

  private async calculateMarketProfile(exchangeSymbols: ISymbols, symbol: string, interval: INTERVALS, exchange: Exchange, candles: ICandle[]) {
    try {
      const tickSize: number | null = exchangeSymbols[symbol] ? Number(exchangeSymbols[symbol]) : null
      if (interval === INTERVALS.THIRTY_MINUTES) {
        const marketProfile: IMarketProfile = this.technicalAnalysisService.calcMarketProfile(TIME_PERIODS.DAY, tickSize, candles)
        const { high, low, VAH, VAL, POC } = marketProfile?.marketProfiles?.[marketProfile.marketProfiles.length - 1]?.valueArea
        const { VAH: pdVAH, VAL: pdVAL, POC: pdPOC } = marketProfile?.marketProfiles?.[marketProfile.marketProfiles.length - 2]?.valueArea
        const excess: ISignal | undefined = marketProfile?.marketProfiles?.[marketProfile.marketProfiles.length - 1]?.excess?.pop()
        const singlePrint: ISignal | undefined = marketProfile?.marketProfiles?.[marketProfile.marketProfiles.length - 1]?.singlePrints?.pop()
        const poorHighLow: ISignal | undefined = marketProfile?.marketProfiles?.[marketProfile.marketProfiles.length - 1]?.poorHighLow?.pop()
        this.logger.log({ high, low, VAH, VAL, POC, pdVAH, pdVAL, pdPOC, excess, singlePrint, poorHighLow })
      } else if (interval === INTERVALS.ONE_HOUR) {
        const marketProfile: IMarketProfile = this.technicalAnalysisService.calcMarketProfile(TIME_PERIODS.WEEK, tickSize, candles)
        const { VAH: wVAH, VAL: wVAL, POC: wPOC } = marketProfile?.marketProfiles?.[marketProfile.marketProfiles.length - 1]?.valueArea
        const { VAH: pwVAH, VAL: pwVAL, POC: pwPOC } = marketProfile?.marketProfiles?.[marketProfile.marketProfiles.length - 2]?.valueArea
        this.logger.log({ wVAH, wPOC, wVAL, pwVAH, pwVAL, pwPOC })
      } else if (interval === INTERVALS.ONE_DAY) {
        const marketProfile: IMarketProfile = this.technicalAnalysisService.calcMarketProfile(TIME_PERIODS.MONTH, tickSize, candles)
        const dOpen: number | null = this.technicalAnalysisService.getKeyPriceLevel(TIME_PERIODS.DAY, 'open', candles)
        const { VAH: mVAH, VAL: mVAL, POC: mPOC } = marketProfile?.marketProfiles?.[marketProfile.marketProfiles.length - 1]?.valueArea
        const { VAH: pmVAH, VAL: pmVAL, POC: pmPOC } = marketProfile?.marketProfiles?.[marketProfile.marketProfiles.length - 2]?.valueArea
        this.logger.log({ dOpen, mVAH, mVAL, mPOC, pmVAH, pmVAL, pmPOC })
      } else if (interval === INTERVALS.ONE_WEEK) {
        const wOpen: number | null = this.technicalAnalysisService.getKeyPriceLevel(TIME_PERIODS.WEEK, 'open', candles)
        this.logger.log({ wOpen })
      } else if (interval === INTERVALS.ONE_MONTH) {
        const mOpen: number | null = this.technicalAnalysisService.getKeyPriceLevel(TIME_PERIODS.MONTH, 'open', candles)
        this.logger.log({ mOpen })
      }
    } catch (error) {
      this.logger.error(`Failed to calculate Market Profile for ${exchange}, ${symbol}, ${interval}.`, error)
    }
  }
}
