import { Injectable, Logger } from '@nestjs/common'
import testData from './test-dummy-data/BTCUSDT/kline/30m.json'
import oneDay from './test-dummy-data/BTCUSDT/kline/1d.json'
import { INTERVALS, TIME_PERIODS } from '@exchanges/constants/candlesticks.types'
import { Exchange } from '@exchanges/constants/exchanges'
import { ISymbols } from '@exchanges/exchanges.types'
import { IBollingerBandSignal } from '@technical-analysis/indicators/bollingerBands/bollingerBands.types'
import { EmaCrossingMultiResult } from '@technical-analysis/indicators/movingAverage/movingAverage.types'
import { PivotPointData } from '@technical-analysis/indicators/pivotPoints/pivotPoints.types'
import { CANDLE_OBSERVATIONS, IMarketProfile } from '@technical-analysis/marketProfile/marketProfile.types'
import { IRanges } from '@technical-analysis/range/range.types'
import { ISignal } from '@technical-analysis/signals/signals.types'
import { TechnicalAnalysisService } from '@technical-analysis/technical-analysis.service'
import { ICandle } from '@trading/dto/candle.dto'

const data = testData.map((data) => ({
  ...data,
  openTime: new Date(data.openTime),
  closeTime: new Date(data.closeTime)
}))

const BTCUSDT1d = oneDay.map((data) => ({
  ...data,
  openTime: new Date(data.openTime),
  closeTime: new Date(data.closeTime)
}))

// For Ticksizes
const symbolTickSizes = {
  BTCUSDT: '0.5'
}

@Injectable()
export class AppService {
  private logger: Logger
  constructor(private readonly technicalAnalysisService: TechnicalAnalysisService) {
    this.logger = new Logger(AppService.name)
    const symbol: string = 'BTCUSDT'
    const interval: INTERVALS = INTERVALS.THIRTY_MINUTES
    const exchange: Exchange = Exchange.BINANCE
    this.calcBollingerCrossover(symbol, interval, exchange, data)
    this.calculateEmaCrossing(symbol, interval, exchange, data)
    this.calculatePivotPoints(symbol, interval, exchange, data)
    this.calculateMarketProfile(symbolTickSizes, symbol, interval, exchange, data)
    this.calcRanges(symbol, interval, exchange, BTCUSDT1d)
  }

  private calculateEmaCrossing(symbol: string, interval: INTERVALS, exchange: Exchange, candles: ICandle[]) {
    const emaCrossingMultiResult: EmaCrossingMultiResult = this.technicalAnalysisService.calcEmaCrossing(interval, candles)
    this.logger.log({ emaCrossingMultiResult })
    try {
    } catch (error) {
      this.logger.error(`Error calculating EMA Crossing Signal for ${symbol} on ${exchange}`, error)
    }
  }

  private calcBollingerCrossover(symbol: string, interval: INTERVALS, exchange: Exchange, candles: ICandle[]) {
    try {
      const bollingerSignal: IBollingerBandSignal | null = this.technicalAnalysisService.calcBollingerCrossover(interval, candles)
      this.logger.log({ bollingerSignal })
    } catch (error) {
      this.logger.error(`Error calculating Bollinger Crossover Signal for ${symbol} on ${exchange}`, error)
    }
  }

  private async calculatePivotPoints(symbol: string, interval: INTERVALS, exchange: Exchange, candles: ICandle[]) {
    try {
      const pivotPoints: PivotPointData = this.technicalAnalysisService.calcPivotPoints(interval, candles)
      this.logger.log({ pivotPoints })
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

  private async calcRanges(symbol: string, interval: INTERVALS, exchange: Exchange, candles: ICandle[]) {
    try {
      const ranges: IRanges = this.technicalAnalysisService.findRanges(candles)
      this.logger.log({ ranges })
    } catch (error) {
      this.logger.error(`Error calculating Pivot Points for ${symbol} on ${exchange}`, error)
    }
  }
}
