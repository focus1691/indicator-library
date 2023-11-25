import { MA_Periods } from './movingAverage.types'

export const calculateSMA = (data: number[], periods: MA_Periods) => {
  const sma: number =
    data.slice(periods, data.length).reduce((acc, curr) => acc + curr, 0) / periods
  return sma
}
