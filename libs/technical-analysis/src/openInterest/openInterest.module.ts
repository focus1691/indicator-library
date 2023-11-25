import { Module } from '@nestjs/common'
import { OpenInterestService } from '@technical-analysis/openInterest/openInterest.service'
import { EmaIndicator } from '@technical-analysis/indicators/movingAverage/ema'
import { PeakDetector } from '@technical-analysis/peakDetector/peakDetector.service'

@Module({
  providers: [
    {
      provide: 'PeakDetector',
      useFactory: () => {
        return new PeakDetector(OpenInterestService.LAG, OpenInterestService.THRESHOLD, OpenInterestService.INFLUENCE)
      }
    },
    OpenInterestService,
    EmaIndicator
  ],
  exports: [OpenInterestService]
})
export class OpenInterestModule {}
