import { Module } from '@nestjs/common'
import { ExchangesService } from './exchanges.service'

@Module({
  providers: [ExchangesService],
  exports: [ExchangesService]
})
export class ExchangesModule {}
