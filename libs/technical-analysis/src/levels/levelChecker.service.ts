import { Injectable } from '@nestjs/common'
import { IPriceLevels, IPriceLevelInformation } from '@technical-analysis/marketProfile/marketProfile.types'
import { VALUE_AREA, VALUE_AREA_PERIODS, VALUE_AREA_TENSE, IValueArea } from '@technical-analysis/valueArea/valueArea.types'
import { LEVEL_ZONE } from './levels.types'

@Injectable()
export class LevelCheckerService {
  public findClosestLevel(data: [IValueArea, VALUE_AREA_PERIODS, VALUE_AREA_TENSE], close: number): IPriceLevels {
    let cloestPriceToResistance: number = Infinity
    let cloestPriceToSupport: number = Infinity

    const priceLevels: IPriceLevels = {
      support: {
        levelType: LEVEL_ZONE.SUPPORT,
        tense: VALUE_AREA_TENSE.PREVIOUS
      } as IPriceLevelInformation,
      resistance: {
        levelType: LEVEL_ZONE.RESISTANCE,
        tense: VALUE_AREA_TENSE.PREVIOUS
      } as IPriceLevelInformation
    }

    function checkVAPeriodLevels(VA: IValueArea, period: VALUE_AREA_PERIODS, tense: VALUE_AREA_TENSE) {
      for (const [level, price] of Object.entries(VA)) {
        const diff: number = Math.abs(price - close)
        if (close <= price && diff < cloestPriceToResistance) {
          cloestPriceToResistance = diff
          priceLevels.resistance.level = level.toLocaleLowerCase() as VALUE_AREA
          priceLevels.resistance.period = period
          priceLevels.resistance.tense = tense
          priceLevels.resistance.price = price
        }
        if (close >= price && diff < cloestPriceToSupport) {
          cloestPriceToSupport = diff
          priceLevels.support.level = level.toLocaleLowerCase() as VALUE_AREA
          priceLevels.support.period = period
          priceLevels.support.tense = tense
          priceLevels.support.price = price
        }
      }
    }
    checkVAPeriodLevels(data[0], data[1], data[2])
    return priceLevels
  }
}
