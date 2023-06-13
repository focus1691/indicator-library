import { Injectable } from '@nestjs/common'
import _ from 'lodash'
import moment from 'moment'
import momentTimezone from 'moment-timezone'
import { TIME_PERIODS } from '@utils/constants/candlesticks'
import { IKlineExchangeKey } from '@utils/constants/dataTypeExchangeKeys'
import { getTicksFromPrice } from '@utils/math'
import { getTimestampForExchange } from '@utils/time'
import { LevelCheckerService } from '@technical-analysis/levelChecker/levelChecker.service'
import {
  EXCESS_TAIL_LENGTH_SIGNIFICANCE,
  POOR_HIGH_LOW_KLINE_LENGTH_SIGNIFICANCE,
  SINGLE_PRINTS_KLINE_LENGTH_SIGNIFICANCE
} from '@technical-analysis/marketProfile/marketProfile.constants'
import { IInitialBalance, IMarketProfile, IMarketProfileObservation, MARKET_PROFILE_OPEN_TYPES } from '@technical-analysis/marketProfile/marketProfile.types'
import { convertTpoPeriodToLetter } from '@technical-analysis/marketProfile/marketProfile.utils'
import { ValueAreaService } from '@technical-analysis/valueArea/valueArea.service'
import { INakedPointOfControl, IValueArea } from '@technical-analysis/valueArea/valueArea.types'

@Injectable()
export class MarketProfileService {
  constructor(private valueAreaService: ValueAreaService, private levelChecker: LevelCheckerService) {
    moment.updateLocale('en', {
      week: {
        dow: 1 // Monday is the first day of the week.
      }
    })
    momentTimezone.tz.setDefault('Europe/London')
  }

  getMarketProfile(key: IKlineExchangeKey, period: TIME_PERIODS, data, tpoSize?: number, tickSize?: number): IMarketProfile[] {
    if (period === TIME_PERIODS.DAY && (!tpoSize || !tickSize)) throw new Error('No TPO Size / Tick Size to process the market profile calculations')

    const timestamp = getTimestampForExchange(key, data[0])
    const from: moment.Moment = moment(timestamp).startOf(period)
    const marketProfiles: IMarketProfile[] = []
    let tpos = []
    do {
      const marketProfile: IMarketProfile = { startOfPeriod: from.unix() }
      // Filter the Klines for this period alone
      tpos = data.filter((kline) => {
        const timestamp = getTimestampForExchange(key, kline)
        return moment(timestamp).isSame(from, period)
      })
      if (!_.isEmpty(tpos)) {
        const valueArea: IValueArea = this.valueAreaService.getLevelsForPeriod(key, tpos)
        marketProfile.valueArea = valueArea
        const numTpos: number = tpoSize * tpos.length

        if (period === TIME_PERIODS.DAY) {
          marketProfile.IB = this.calcInitialBalance(key, tpos)
          if (marketProfiles.length > 0 && marketProfile.IB.low && marketProfile.IB.high && numTpos > 2) {
            marketProfile.failedAuction = this.isFailedAuction(key, tpos, marketProfile.IB)
            marketProfile.excess = this.findExcess(key, tpos, marketProfile.valueArea)
            marketProfile.poorHighLow = this.findPoorHighAndLows(key, tpos, marketProfile.valueArea)
            marketProfile.singlePrints = this.findSinglePrints(key, tpos)
            // marketProfile.ledges = this.findLedges(key, tpos, marketProfile.valueArea)
            marketProfile.ledges = []
            marketProfile.openType = this.findOpenType(key, tpos, tpoSize, tickSize, marketProfile.IB, marketProfiles[marketProfiles.length - 1]?.valueArea)
            // marketProfile.dayType = this.findDayType(key, tpos, tickSize, marketProfile.IB)
          }
        }
        from.add(1, period) // Go to the previous day / week / month
        marketProfiles.push(marketProfile)
      }
    } while (!_.isEmpty(tpos))
    return marketProfiles
  }

  calcInitialBalance(key: IKlineExchangeKey, tpos: any): IInitialBalance {
    const firstTPOPeriods = tpos.filter((kline) => {
      const timestamp = getTimestampForExchange(key, kline)
      const hour: number = moment(timestamp).hour()
      // The first 2 TPO's are the first 30 minutes
      // The 2 candle times are between 00:00 and 01:00
      return hour === 0
    })
    const low: number = _.isEmpty(firstTPOPeriods) ? null : Math.min(...firstTPOPeriods.map((kline) => kline[key.low]))
    const high: number = _.isEmpty(firstTPOPeriods) ? null : Math.max(...firstTPOPeriods.map((kline) => kline[key.high]))
    const IB: IInitialBalance = { high, low }
    return IB
  }

  isFailedAuction(key: IKlineExchangeKey, tpos: any, IB: IInitialBalance): IMarketProfileObservation[] {
    const failedAuctions: IMarketProfileObservation[] = []
    let ibBroken = false
    for (let i = 0; i < tpos.length; i++) {
      const breakAbove = tpos[i][key.high] > IB.high
      const breakBelow = tpos[i][key.low] < IB.low
      if (!ibBroken && (breakAbove || breakBelow)) {
        ibBroken = true
        for (let j = i + 1; j < tpos.length; j++) {
          if ((breakAbove && tpos[j][key.close] < IB.high) || (breakBelow && tpos[j][key.close] > IB.low)) {
            failedAuctions.push({ period: convertTpoPeriodToLetter(j), direction: breakAbove ? 1 : -1 })
          }
          return failedAuctions
        }
      }
    }
    return failedAuctions
  }

  findExcess(key: IKlineExchangeKey, tpos: any, VA?: IValueArea): IMarketProfileObservation[] {
    const excess: IMarketProfileObservation[] = []

    for (let i = 0; i < tpos.length; i++) {
      const open: number = tpos[i][key.open]
      const high: number = tpos[i][key.high]
      const low: number = tpos[i][key.low]
      const close: number = tpos[i][key.close]
      const klineLength: number = Math.abs(close - open)
      const klineUpperTail: number = Math.abs(close - high)
      const klineLowerTail: number = Math.abs(close - low)

      if (high >= VA.high && klineUpperTail / klineLength > EXCESS_TAIL_LENGTH_SIGNIFICANCE) {
        excess.push({ period: convertTpoPeriodToLetter(i), direction: 1 })
      }
      if (low <= VA.low && klineLowerTail / klineLength > EXCESS_TAIL_LENGTH_SIGNIFICANCE) {
        excess.push({ period: convertTpoPeriodToLetter(i), direction: -1 })
      }
    }
    return excess
  }

  findPoorHighAndLows(key: IKlineExchangeKey, tpos: any, VA?: IValueArea): IMarketProfileObservation[] {
    const poorHighLow: IMarketProfileObservation[] = []

    for (let i = 0; i < tpos.length; i++) {
      const open: number = tpos[i][key.open]
      const high: number = tpos[i][key.high]
      const low: number = tpos[i][key.low]
      const close: number = tpos[i][key.close]
      const klineLength: number = Math.abs(close - open)
      const klineUpperTail: number = Math.abs(close - high)
      const klineLowerTail: number = Math.abs(close - low)

      if (high >= VA.high && klineLength / klineUpperTail > POOR_HIGH_LOW_KLINE_LENGTH_SIGNIFICANCE) {
        poorHighLow.push({ period: convertTpoPeriodToLetter(i), direction: 1 })
      }
      if (low <= VA.low && klineLength / klineLowerTail > POOR_HIGH_LOW_KLINE_LENGTH_SIGNIFICANCE) {
        poorHighLow.push({ period: convertTpoPeriodToLetter(i), direction: -1 })
      }
    }
    return poorHighLow
  }

  findSinglePrints(key: IKlineExchangeKey, tpos: any): IMarketProfileObservation[] {
    const singlePrints: IMarketProfileObservation[] = []
    const numTpos: number = tpos.length

    // Find the length of the Kline
    const klineLengths = tpos.map((tpo) => Math.abs(tpo[key.close] - tpo[key.open]))
    const klineLengthsTotal = klineLengths.reduce((acc, tot) => acc + tot)
    const averageKlineLength = klineLengthsTotal / numTpos

    let highestHigh = Math.max(tpos[0][key.close], tpos[0][key.open])
    let lowestLow = Math.min(tpos[0][key.close], tpos[0][key.open])

    for (let i = 1; i < numTpos - 1; i++) {
      const open: number = tpos[i][key.open]
      const close: number = tpos[i][key.close]
      const previousClose: number = tpos[i - 1][key.close]
      const high: number = tpos[i][key.high]
      const low: number = tpos[i][key.low]
      const klineLength = Math.abs(close - open)
      const isLongCandle = klineLength / averageKlineLength > SINGLE_PRINTS_KLINE_LENGTH_SIGNIFICANCE
      const direction = close > previousClose ? 1 : -1

      const isNewHighMade: boolean = close > highestHigh
      const isNewLowMade: boolean = close < lowestLow

      if (isNewHighMade) highestHigh = close
      if (isNewLowMade) lowestLow = close

      if (isLongCandle && (isNewHighMade || isNewLowMade)) {
        let isPriceRetraced = false
        for (let k = i + 1; k < numTpos; k++) {
          if ((direction === 1 && tpos[k][key.low] < low) || (direction === -1 && tpos[k][key.high] > high)) {
            isPriceRetraced = true
            break
          }
        }
        if (!isPriceRetraced) {
          singlePrints.push({ period: convertTpoPeriodToLetter(i), direction })
        }
      }
    }
    return singlePrints
  }

  findLedges(key: IKlineExchangeKey, tpos: any, VA?: IValueArea, tolerancePercent: number = 0.01): IMarketProfileObservation[] {
    const ledges: IMarketProfileObservation[] = []
    const groupedLedges: number[][] = []

    // Find the range of TPO prices
    const prices = tpos.map((tpo) => tpo[key.close])
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice

    // Calculate the tolerance range
    const tolerance = Math.round(tolerancePercent * priceRange)

    for (let i = 0; i < tpos.length; i++) {
      let groupFound = false

      // check if there is a group of TPOs within the tolerance range
      if (groupedLedges.length > 0) {
        const last: number = groupedLedges.length - 1
        const size: number = groupedLedges[last]?.length
        const close: number = tpos[i][key.close]
        const total: number = groupedLedges[last].map((v) => tpos[v][key.close]).reduce((accumulator, currentValue) => accumulator + currentValue, 0)
        const avg: number = total / size

        if (total > 0 && Math.abs(Number(avg) - close) <= tolerance) {
          groupedLedges[last].push(i)
          groupFound = true
          i++
        }
      }

      // if no group was found, create a new group
      if (!groupFound) {
        groupedLedges.push([i])
      }
    }

    // check if each group of TPOs meets the criteria for a ledge
    for (let i = 0; i < groupedLedges.length; i++) {
      if (groupedLedges[i].length >= 2) {
        const closes = groupedLedges[i].map((value) => tpos[value][key.close])
        const low = Math.min(...closes)
        const high = Math.max(...closes)
        const close = closes.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / closes?.length ?? 0

        const isLedge = low >= VA?.VAL && high <= VA?.VAH
        const direction = close < VA?.POC ? -1 : 1
        if (isLedge) {
          ledges.push({ period: convertTpoPeriodToLetter(groupedLedges[i][0]), direction })
        }
      }
    }

    return ledges
  }

  isInBalance(tpo: any, key: IKlineExchangeKey, VA?: IValueArea): boolean {
    return tpo[key.high] <= VA.VAH && tpo[key.low] >= VA.VAL
  }

  isLevelBreakoutUp(key: IKlineExchangeKey, tpo: any, VA?: IValueArea): boolean {
    return tpo[key.high] > VA.VAH
  }

  isLevelBreakoutDown(key: IKlineExchangeKey, tpo: any, VA?: IValueArea): boolean {
    return tpo[key.low] < VA.VAL
  }

  findOpenType(key: IKlineExchangeKey, tpos: any, tpoSize: number, tickSize: number, IB: IInitialBalance, pdVA?: IValueArea): MARKET_PROFILE_OPEN_TYPES {
    const { up: ticksAboveOpen, down: ticksBelowOpen } = getTicksFromPrice(key, tpos[0], key.open, tickSize)
    const tickMovement: number = Math.abs(ticksAboveOpen - ticksBelowOpen)
    let openAuction: boolean = true
    let retestedLevel: boolean = false

    if ((ticksAboveOpen <= 1 || ticksBelowOpen <= 1) && tickMovement > 50) {
      const openedAboveBalance = tpos[0][key.open] > pdVA.VAH
      const openedBelowBalance = tpos[0][key.open] < pdVA.VAL
      const firstTpoLevelBreakup: boolean = ticksAboveOpen > 1 && this.isLevelBreakoutUp(key, tpos[0], pdVA)
      const firstTpoLevelBreakdown: boolean = ticksBelowOpen > 1 && this.isLevelBreakoutDown(key, tpos[0], pdVA)
      const startingTpos: number = 4 / tpoSize

      if (openedAboveBalance || openedBelowBalance) {
        for (let i = 1; i < startingTpos; i++) {
          if ((openedAboveBalance && !this.isLevelBreakoutUp(key, tpos[i], pdVA)) || (openedBelowBalance && !this.isLevelBreakoutDown(key, tpos[i], pdVA))) {
            retestedLevel = true
          }
        }
        for (let i = startingTpos; i < tpos.length / 2; i++) {
          const breakBackAbove: boolean = this.isLevelBreakoutUp(key, tpos[i], pdVA)
          const breakBackBelow: boolean = this.isLevelBreakoutDown(key, tpos[i], pdVA)
          if ((openedAboveBalance && retestedLevel && breakBackAbove) || (openedBelowBalance && retestedLevel && breakBackBelow)) {
            return MARKET_PROFILE_OPEN_TYPES.OPEN_TEST_DRIVE
          }
        }
      }

      if (firstTpoLevelBreakup || firstTpoLevelBreakdown) {
        for (let i = 1; i < startingTpos; i++) {
          if (
            (firstTpoLevelBreakup && !this.isLevelBreakoutUp(key, tpos[i], pdVA)) ||
            (firstTpoLevelBreakdown && !this.isLevelBreakoutDown(key, tpos[i], pdVA))
          ) {
            return MARKET_PROFILE_OPEN_TYPES.OPEN_REJECTION_REVERSE
          }
        }
      }
      return MARKET_PROFILE_OPEN_TYPES.OPEN_DRIVE
    }

    for (let i = 0; i < tpos.length; i++) {
      if (openAuction && !this.isInBalance(tpos[i], key, pdVA)) {
        openAuction = false
      }
    }

    if (openAuction === true) {
      return MARKET_PROFILE_OPEN_TYPES.OPEN_AUCTION
    }

    return null
  }

  // findDayType(key: IKlineExchangeKey, tpos: any, tickSize: number, IB: IInitialBalance): MARKET_PROFILE_DAY_TYPES {
  //   let dayType: MARKET_PROFILE_DAY_TYPES
  //   return dayType
  // }

  getPrice(klineExchangeKey: IKlineExchangeKey, data: any, timePeriod: TIME_PERIODS, key: string | number, goBackByOne?: boolean): number {
    const period: moment.Moment = moment().startOf(timePeriod)
    goBackByOne && period.subtract(1, timePeriod)
    let price: number

    // Start checking the most recent Klines first
    for (let i = data.length - 1; i >= 0; i--) {
      const timestamp = getTimestampForExchange(klineExchangeKey, data[i])
      const openTime: moment.Moment = moment(timestamp)
      if (openTime.isSame(period, timePeriod)) {
        price = data[i][key]
      }
      if (openTime.isBefore(period)) break // The latest Kline date is before yesterday so it can't be there
    }
    return price
  }

  findNakedPointOfControl(marketProfiles: IMarketProfile[]): INakedPointOfControl {
    if (_.isEmpty(marketProfiles) || marketProfiles.length <= 1) return null

    const npoc: INakedPointOfControl = { support: null, resistance: null }
    let high: number = marketProfiles[marketProfiles.length - 1]?.valueArea?.high
    let low: number = marketProfiles[marketProfiles.length - 1]?.valueArea?.low

    for (let i = marketProfiles.length - 2; i >= 0; i--) {
      const curr: IMarketProfile = marketProfiles[i]

      // The NPOC to the upside or downside is valid if the POC is above any previous high or low, respectively
      if (npoc.resistance === null && curr.valueArea?.POC > high) npoc.resistance = curr.valueArea?.POC
      if (npoc.support === null && curr.valueArea?.POC < low) npoc.support = curr.valueArea?.POC

      // Set the new highs and lows
      if (curr.valueArea?.high > high) high = curr.valueArea.high
      if (curr.valueArea?.low < low) low = curr.valueArea.low

      // Return if both NPOC's are found -- no more checks are required
      if (npoc.resistance !== null && npoc.support !== null) return npoc
    }
    return npoc
  }
}
