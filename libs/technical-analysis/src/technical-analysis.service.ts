import { Injectable } from '@nestjs/common'
import { INTERVALS, TIME_PERIODS } from '@exchanges/constants/candlesticks.types'
import { BollingerBandsIndicator } from '@technical-analysis/indicators/bollingerBands/bollingerBands.service'
import { IBollingerBandSignal } from '@technical-analysis/indicators/bollingerBands/bollingerBands.types'
import { EmaIndicator } from '@technical-analysis/indicators/movingAverage/ema'
import { EmaCrossingIndicator } from '@technical-analysis/indicators/movingAverage/emaCrossing'
import { EmaCrossingMultiResult, EmaCrossingResult, IEmaOutcome, MA_Periods } from '@technical-analysis/indicators/movingAverage/movingAverage.types'
import { PivotPointsIndicator } from '@technical-analysis/indicators/pivotPoints/pivotPoints.service'
import { PivotPointData } from '@technical-analysis/indicators/pivotPoints/pivotPoints.types'
import { VWAPIndicator } from '@technical-analysis/indicators/vwap/vwap.service'
import { MarketProfileService } from '@technical-analysis/marketProfile/marketProfile.service'
import { OpenInterestService } from '@technical-analysis/openInterest/openInterest.service'
import { IPeakSignal } from '@technical-analysis/peakDetector/peakDetector.types'
import { RangesService } from '@technical-analysis/range/range.service'
import { SIGNAL_DIRECTION, SIGNALS } from '@technical-analysis/signals/signals.types'
import { TechnicalIndicators } from '@technical-analysis/technicalAnalysis.types'
import { ICandle, IFundingRateCandle, IOpenInterestCandle } from '@trading/dto/candle.dto'
import { Exchange } from '@exchanges/constants/exchanges'
import { IMarketProfile } from './marketProfile/marketProfile.types'
import { IRanges } from './range/range.types'

const EMA_CROSSINGS = Object.freeze([
  { shortPeriod: MA_Periods.NINE, longPeriod: MA_Periods.TWENTY_ONE },
  { shortPeriod: MA_Periods.FIFTY, longPeriod: MA_Periods.ONE_HUNDRED },
  { shortPeriod: MA_Periods.FIFTY, longPeriod: MA_Periods.TWO_HUNDRED }
])

@Injectable()
export class TechnicalAnalysisService {
  constructor(
    private readonly marketProfile: MarketProfileService,
    private readonly rangeService: RangesService,
    private readonly emaIndicator: EmaIndicator,
    private readonly emaCrossingIndicator: EmaCrossingIndicator,
    private readonly bollingerBandsIndicator: BollingerBandsIndicator,
    private readonly pivotPointsIndicator: PivotPointsIndicator,
    private readonly vwapIndicator: VWAPIndicator,
    private readonly openInterestService: OpenInterestService
  ) {}

  public calcEmaCrossing(interval: string, data: ICandle[]): EmaCrossingMultiResult | null {
    const signals: EmaCrossingMultiResult = {}
    let signalFound: boolean = false

    for (const { shortPeriod, longPeriod } of EMA_CROSSINGS) {
      const signal: EmaCrossingResult | null = this.emaCrossingIndicator.detectCrossing(interval, data, shortPeriod, longPeriod)

      if (signal) {
        const key = `${MA_Periods[shortPeriod]}/${MA_Periods[longPeriod]}`
        signals[key] = signal
        signalFound = true
      }
    }

    return signalFound ? signals : null
  }

  public calcBollingerCrossover(interval: string, data: ICandle[]): IBollingerBandSignal | null {
    return this.bollingerBandsIndicator.detectBollingerCrossover(interval, data)
  }

  public calcPivotPoints(interval: string, data: ICandle[]): PivotPointData | null {
    return this.pivotPointsIndicator.calculatePivotPoints(interval, data)
  }

  public calcLatestOpenInterestMarketSentiment(interval: string, data: IOpenInterestCandle[]): IPeakSignal | null {
    return this.openInterestService.findLatestMarketSentiment(interval, data)
  }

  public calcLatestFundingRateMarketSentiment(data: IFundingRateCandle[]): IPeakSignal | null {
    const latestCandle: IFundingRateCandle = data?.[data.length - 1]

    if (latestCandle) {
      const signal: IPeakSignal = {
        intervals: [INTERVALS.EIGHT_HOURS],
        indicator: TechnicalIndicators.FUNDING_RATE_SENTIMENT,
        type: SIGNALS.MARKET_SENTIMENT,
        direction: latestCandle.fundingRate > 0 ? SIGNAL_DIRECTION.BULLISH : SIGNAL_DIRECTION.BEARISH
      }
      return signal
    }
    return null
  }

  public calcMarketProfile(period: TIME_PERIODS, tickSize: number, data: ICandle[]): IMarketProfile {
    const tpoSize = 1 // represents one 30m candle
    return this.marketProfile.getMarketProfile(period, data, tpoSize, tickSize)
  }

  public getKeyPriceLevel(period: TIME_PERIODS, price: string | number, data: ICandle[], goBackByOne: boolean = false): number | null {
    return this.marketProfile.getPrice(data, period, price, goBackByOne)
  }

  private findAndCacheRange(symbol: string, exchange: Exchange, data: ICandle[]): IRanges {
    const ranges: IRanges = this.rangeService.findRanges(data)
    return ranges
  }

  private calcEMAs(priceKey: string | number, data): IEmaOutcome {
    return this.emaIndicator.calculateEmas(data.map((v) => v[priceKey]))
  }
}
