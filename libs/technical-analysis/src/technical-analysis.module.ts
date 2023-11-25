import { Module } from '@nestjs/common'
import { BollingerBandsIndicator } from '@technical-analysis/indicators/bollingerBands/bollingerBands.service'
import { EmaIndicator } from '@technical-analysis/indicators/movingAverage/ema'
import { EmaCrossingIndicator } from '@technical-analysis/indicators/movingAverage/emaCrossing'
import { PivotPointsIndicator } from '@technical-analysis/indicators/pivotPoints/pivotPoints.service'
import { VWAPIndicator } from '@technical-analysis/indicators/vwap/vwap.service'
import { LevelCheckerService } from '@technical-analysis/levels/levelChecker.service'
import { MarketProfileService } from '@technical-analysis/marketProfile/marketProfile.service'
import { OpenInterestModule } from '@technical-analysis/openInterest/openInterest.module'
import { RangeModule } from '@technical-analysis/range/range.module'
import { TechnicalAnalysisService } from '@technical-analysis/technical-analysis.service'
import { ValueAreaService } from '@technical-analysis/valueArea/valueArea.service'

@Module({
  imports: [RangeModule, OpenInterestModule],
  providers: [
    TechnicalAnalysisService,
    MarketProfileService,
    ValueAreaService,
    LevelCheckerService,
    VWAPIndicator,
    EmaIndicator,
    EmaCrossingIndicator,
    BollingerBandsIndicator,
    PivotPointsIndicator
  ],
  exports: [
    TechnicalAnalysisService,
    MarketProfileService,
    ValueAreaService,
    LevelCheckerService,
    VWAPIndicator,
    EmaIndicator,
    EmaCrossingIndicator,
    BollingerBandsIndicator,
    PivotPointsIndicator
  ]
})
export class TechnicalAnalysisModule {}
