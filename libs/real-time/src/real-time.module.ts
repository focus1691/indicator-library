import { Module } from '@nestjs/common'
import { RealTimeService } from './real-time.service'

@Module({
  providers: [RealTimeService],
  exports: [RealTimeService]
})
export class RealTimeModule {}
