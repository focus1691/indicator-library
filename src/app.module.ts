import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { TechnicalAnalysisModule } from '@technical-analysis/technical-analysis.module'

@Module({
  imports: [TechnicalAnalysisModule],
  controllers: [],
  providers: [AppService]
})
export class AppModule {}
