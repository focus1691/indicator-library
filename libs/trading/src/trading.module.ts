import { Module } from '@nestjs/common'
import { TradingService } from './trading.service'

@Module({
  providers: [TradingService],
  exports: [TradingService]
})
export class TradingModule {}
