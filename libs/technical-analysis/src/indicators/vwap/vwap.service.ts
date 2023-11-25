import { Injectable } from '@nestjs/common'
import { IKlineExchangeKey } from '@exchanges/constants/dataTypeExchangeKeys'
import { round } from '@technical-analysis/utils/math'

@Injectable()
export class VWAPIndicator {
  public static calculateVWAPs(dataKey: IKlineExchangeKey, klines): number[] {
    const vwaps = []
    let cumulativeTypicalPrice: number = 0
    let cumulativeVolume: number = 0

    for (let i = 0; i < klines.length; i++) {
      const high: number = Number(klines[i][dataKey.high])
      const low: number = Number(klines[i][dataKey.low])
      const close: number = Number(klines[i][dataKey.close])
      const volume: number = Number(klines[i][dataKey.volume])
      const typicalPrice: number = round((close + high + low) / 3)
      cumulativeTypicalPrice += typicalPrice * volume
      cumulativeVolume += volume
      const vwap: number = cumulativeTypicalPrice / cumulativeVolume
      vwaps.push(vwap)
    }
    return vwaps
  }
  public calculateVWAP(dataKey: IKlineExchangeKey, klines): number {
    return VWAPIndicator.calculateVWAPs(dataKey, klines)?.pop()
  }
}
