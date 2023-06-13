import { Injectable } from '@nestjs/common'
import moment from 'moment'
import { TIME_PERIODS } from '@utils/constants/candlesticks'
import { IKlineExchangeKey } from '@utils/constants/dataTypeExchangeKeys'
import { round } from '@utils/math'
import { getTimestampForExchange } from '@utils/time'
import { IYahooFinanceChart } from '@technical-analysis/yahooFinance/yahooFinance.responses'
import { ILinearRegression } from '@technical-analysis/regression/regression.types'

@Injectable()
export class LinearRegressionService {
  public calcLinearRegression(x: number[], y: number[]): ILinearRegression {
    const n: number = Math.min(x.length, y.length)
    let sumX: number = 0
    let sumY: number = 0
    let sumXSquared: number = 0
    let sumYSquared: number = 0
    let sumXYProducts: number = 0

    for (let i = 0; i < n; i++) {
      sumX += x[i]
      sumY += y[i]
      sumXSquared += Math.pow(x[i], 2)
      sumYSquared += Math.pow(y[i], 2)
      sumXYProducts += x[i] * y[i]
    }
    const meanX: number = round(sumX / n, 3) || null
    const meanY: number = round(sumY / n, 3) || null

    let r: number = (n * sumXYProducts - sumX * sumY) / Math.sqrt((n * sumXSquared - Math.pow(sumX, 2)) * (n * sumYSquared - Math.pow(sumY, 2)))
    let r2: number = Math.pow(r, 2)

    sumX = sumX ? round(sumX, 3) : null
    sumY = sumY ? round(sumY, 3) : null
    sumXSquared = sumXSquared ? round(sumXSquared, 3) : null
    sumYSquared = sumYSquared ? round(sumYSquared, 3) : null
    sumXYProducts = sumXYProducts ? round(sumXYProducts, 3) : null
    r = r ? round(r, 3) : null
    r2 = r2 ? round(r2, 3) : null

    return { sumX, sumY, sumXSquared, sumYSquared, sumXYProducts, meanX, meanY, r, r2 }
  }

  public matchTimeseriesData(exchangeKey: IKlineExchangeKey, klines: any, chart: IYahooFinanceChart, amount: number, duration: string): [number[], number[]] {
    let stockIndex = 0
    let klineIndex = 0
    const x: number[] = []
    const y: number[] = []
    const stockTimestamps: number[] = []
    const startOfPeriod = moment().subtract(amount as moment.DurationInputArg1, duration as moment.DurationInputArg2)
    const klinesInPeriod = klines.filter((kline) => moment(getTimestampForExchange(exchangeKey, kline)).isAfter(startOfPeriod))

    chart.timestamp.forEach((timestamp: number, index: number) => {
      if (moment(timestamp * 1000).isAfter(startOfPeriod)) {
        stockTimestamps.push(index)
      }
    })

    while (stockIndex < stockTimestamps.length && klineIndex < klinesInPeriod.length) {
      const t1: moment.Moment = moment(chart.timestamp[stockTimestamps[stockIndex]] * 1000)
      const t2: moment.Moment = moment(getTimestampForExchange(exchangeKey, klinesInPeriod[klineIndex]))
      if (t1.isSame(t2, TIME_PERIODS.DAY)) {
        x.push(chart.indicators.quote[0].high[stockIndex++])
        y.push(Number(klinesInPeriod[klineIndex++][exchangeKey.close]))
      } else if (t1.isBefore(t2)) {
        stockIndex++
      } else if (t2.isBefore(t1)) {
        klineIndex++
      } else {
        break
      }
    }
    return [x, y]
  }
}
