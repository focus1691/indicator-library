import { Module } from '@nestjs/common'
import { TechnicalAnalysisService } from '@technical-analysis/technical-analysis.service'

@Module({
  providers: [TechnicalAnalysisService],
  exports: [TechnicalAnalysisService]
})
export class TechnicalAnalysisModule {}
