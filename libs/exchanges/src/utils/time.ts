import moment from 'moment'

export const isTimePastDestination = (timestamp: number | string, amount: number, duration: string): boolean => {
  return moment().diff(timestamp, duration as moment.unitOfTime.Diff) > amount
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
