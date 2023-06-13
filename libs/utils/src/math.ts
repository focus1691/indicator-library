import { IKlineExchangeKey } from '@utils/constants/dataTypeExchangeKeys'

export function round(number: number, precision: number = 2) {
  if (precision < 0) {
    const factor = Math.pow(10, precision)
    return Math.round(number * factor) / factor
  } else {
    return +(Math.round(Number(number + 'e+' + precision)) + 'e-' + precision)
  }
}

export function average(numbers: number[]) {
  return round(numbers.reduce((prev, curr) => Number(prev) + Number(curr)) / numbers.length, 3)
}

export const countDecimals = function (value: number): number {
  const text: string = value.toString()
  // verify if number 0.000005 is represented as "5e-6"
  if (text.indexOf('e-') > -1) {
    const [, trail] = text.split('e-')
    const deg: number = parseInt(trail, 10)
    return deg
  }
  // count decimals for number in representation like "0.123456"
  if (Math.floor(value) !== value) {
    return value.toString().split('.')[1].length || 0
  }
  return 0
}

export const getTicksFromPrice = (key: IKlineExchangeKey, tpo: any, priceType: string | number, tickSize: number): { up: number, down: number } => {
  const price = tpo[priceType]
  const high = tpo[key.high]
  const low = tpo[key.low]
  const down = low < price ? (price - low) / tickSize : 0
  const up = high > price ? (high - price) / tickSize : 0

  return { up, down }
}

export const isNumberString = (value) => {
  return !isNaN(value) && !isNaN(parseFloat(value))
}
