import { Injectable } from '@nestjs/common'
import { IKlineExchangeKey } from '@utils/constants/dataTypeExchangeKeys'

@Injectable()
export class AverageTrueRange {
  calculateATR(tpos: any, key: IKlineExchangeKey, period: number) {
    let prevATR = 0
    const ATR = []
    for (let i = 1; i < tpos.length; i++) {
      if (i >= period) {
        let sum = 0
        for (let j = i; j > i - period; j--) {
          const TR = Math.max(
            Math.abs(tpos[j][key.high] - tpos[j][key.low]),
            Math.abs(tpos[j][key.high] - tpos[j - 1][key.close]),
            Math.abs(tpos[j][key.low] - tpos[j - 1][key.close])
          )
          sum += TR
        }
        prevATR = sum / period
        ATR.push(prevATR)
      } else {
        ATR.push(0)
      }
    }
    return ATR
  }
}
