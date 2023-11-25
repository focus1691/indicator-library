import { LoggerService } from '@nestjs/common'
import { Observable, of } from 'rxjs'
import { FIVE_MINUTES } from '@exchanges/constants/rateLimit'
import { EXCHANGE_DATA_TYPES } from '@exchanges/constants/exchanges'

export const transformObjectArrayIntoArray = (data: any, key: string) => {
  return data.map(value => value[key])
}

export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const handleErrors =
  (logger: LoggerService, dataType: EXCHANGE_DATA_TYPES) =>
    (err: any): Observable<any> => {
      logger.error(`There was an issue fetching ${dataType}: ${JSON.stringify(err)}`)
      return of({})
    }

export const handleRateLimit =
(logger: LoggerService) =>
  async (err: any): Promise<Observable<any>> => {
    logger.error(`${err?.statusCode} ${err.error}`)
    await delay(FIVE_MINUTES)
    return of({})
  }
