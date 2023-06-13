import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { BinanceWebSocketService } from '@exchanges/binance/BinanceWebsocketService'
import { BybitWebSocketService } from '@exchanges/bybit/BybitWebsocketService'
import { VolumeDeltaService } from '@real-time/volume-delta/volume-delta.service'

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    BybitWebSocketService,
    BinanceWebSocketService,
    VolumeDeltaService
  ],
  exports: [VolumeDeltaService]
})
export class VolumeDeltaModule {}
