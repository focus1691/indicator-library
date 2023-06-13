import { Module } from '@nestjs/common'
import { RangesService } from './range.service'
import { PeakDetector } from '@technical-analysis/peakDetector/peakDetector.service'

@Module({
  providers: [
    {
      provide: 'PeakDetector',
      useFactory: () => {
        return new PeakDetector(RangesService.LAG, RangesService.THRESHOLD, RangesService.INFLUENCE)
      }
    },
    RangesService
  ],
  exports: [RangesService]
})
export class RangeModule {}
