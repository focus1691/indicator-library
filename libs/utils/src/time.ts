import moment from 'moment'
import { IKlineExchangeKey } from '@utils/constants/dataTypeExchangeKeys'
import { isNumberString } from '@utils/math'

export const isTimePastDestination = (timestamp: number | string, amount: number, duration: string): boolean => {
  return moment().diff(timestamp, duration as moment.unitOfTime.Diff) > amount
}

export const getTimestampForExchange = (klineExchangeKey: IKlineExchangeKey, data): number | string => {
  const ts: number | string = isNumberString(data[klineExchangeKey.time]) ? Number(data[klineExchangeKey.time]) : data[klineExchangeKey.time]
  const multiplyBy: number = (isTimePastDestination(ts, 8, 'years') ? 1000 : 1)
  const time: number | string = typeof ts === 'number' ? (ts * multiplyBy) : ts
  return time
}

export const isTimeBeforeDestination = (timestamp: number | string, amount: number, duration: string): boolean => {
  return moment().diff(timestamp, duration as moment.unitOfTime.Diff) < amount
}

export const isBefore = (ts1: number | string, ts2: number | string): boolean => {
  return moment(ts1).diff(moment(ts2)) < 0
}

export const getCurrentTime = (): Date => {
  const date = new Date()
  date.setUTCHours(date.getUTCHours() - 1)

  return date
}
