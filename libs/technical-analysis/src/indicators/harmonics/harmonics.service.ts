import { Injectable } from '@nestjs/common'
import moment from 'moment'
import { from, map, mergeMap, of, toArray } from 'rxjs'
import { ICandle } from '@trading/dto/candle.dto'
import { HARMONIC_PATTERNS, harmonicRatios, IHarmonic, IXABCDPattern, IXABCDRatio } from '@technical-analysis/indicators/harmonics/harmonics.types'
import { PeakDetector } from '@technical-analysis/peakDetector/peakDetector.service'
import { IPeak, IZigZag } from '@technical-analysis/range/range.types'
import { round } from '@technical-analysis/utils/math'

@Injectable()
export class HarmonicsSerice {
  public static LAG: number = 10
  public static THRESHOLD: number = 2
  public static INFLUENCE: number = 1

  constructor(private peakDetector: PeakDetector) {}

  private findXABCDCombinations(zigzags: IZigZag[]): {
    zigzags
    combinations: number[][]
  } {
    const result: number[][] = []

    function* getNext(index: number, count: number, used: number[]) {
      used.push(index)
      if (count === 5) {
        result.push(used)
      } else {
        for (let i = index + 1; i < zigzags.length; i++) {
          if (
            (zigzags[index].direction === 'PEAK' && zigzags[i].direction === 'TROUGH') ||
            (zigzags[index].direction === 'TROUGH' && zigzags[i].direction === 'PEAK')
          ) {
            yield * getNext(i, count + 1, [...used])
          }
        }
      }
    }

    for (let i = 0; i < zigzags.length; i++) {
      const generator = getNext(i, 1, [])
      let current = generator.next()
      while (!current.done) {
        current = generator.next()
      }
    }

    return { zigzags, combinations: result }
  }
  private toZigzags(this: { klines: ICandle[] }, peaks: IPeak[]): IZigZag {
    const zigzag: IZigZag = {} as IZigZag
    for (let i = 0; i < peaks.length; i++) {
      const { position, direction }: IPeak = peaks[i]
      const high: number = Number(this.klines[position]?.high)
      const low: number = Number(this.klines[position]?.low)
      if (!zigzag.price) {
        zigzag.direction = direction === 1 ? 'PEAK' : 'TROUGH'
        zigzag.price = direction === 1 ? high : low
        zigzag.timestamp = moment(this.klines[position].openTime).unix()
      } else {
        if ((zigzag.direction === 'PEAK' && high > zigzag.price) || (zigzag.direction === 'TROUGH' && low < zigzag.price)) {
          zigzag.price = zigzag.direction === 'PEAK' ? high : low
          zigzag.timestamp = moment(this.klines[position].openTime).unix()
        }
      }
    }
    return zigzag
  }

  calcHarmonicRatios(X: IZigZag, A: IZigZag, B: IZigZag, C: IZigZag, D: IZigZag): IXABCDPattern {
    // Caclulate the lengths of each Pivot Point
    const XA: number = Math.abs(X.price - A.price)
    const AB: number = Math.abs(A.price - B.price)
    const BC: number = Math.abs(B.price - C.price)
    const CD: number = Math.abs(C.price - D.price)
    const XD: number = Math.abs(X.price - D.price)

    // Calculate the retracement percent
    const XAB: number = round(AB / XA)
    const ABC: number = round(BC / AB)
    const BCD: number = round(CD / BC)
    const XAD: number = round(XD / XA)

    const XABCD = { X, A, B, C, D, XAB, ABC, BCD, XAD } as IXABCDPattern

    return XABCD
  }

  findHarmonics(type: HARMONIC_PATTERNS, xabcdPattern: IXABCDPattern, ratios: IXABCDRatio): IHarmonic | null {
    const { XAB, ABC, BCD, XAD } = xabcdPattern
    const {
      XAB: [minXAB, maxXAB],
      ABC: [minABC, maxABC],
      BCD: [minBCD, maxBCD],
      XAD: [minXAD, maxXAD]
    } = ratios

    let XAB_ERROR = 0
    if (XAB < minXAB || XAB > maxXAB) {
      XAB_ERROR = Math.abs((XAB - minXAB) / XAB) * 100 + Math.abs((XAB - maxXAB) / XAB) * 100
    }

    let ABC_ERROR = 0
    if (ABC === minABC || ABC === maxABC) {
      ABC_ERROR = 0
    } else if (ABC < minABC || ABC > maxABC) {
      ABC_ERROR = Math.abs((ABC - minABC) / ABC) * 100 + Math.abs((ABC - maxABC) / ABC) * 100
    }

    let BCD_ERROR = 0
    if (BCD < minBCD || BCD > maxBCD) {
      BCD_ERROR = Math.abs((BCD - minBCD) / BCD) * 100 + Math.abs((BCD - maxBCD) / BCD) * 100
    }

    let XAD_ERROR = 0
    if (XAD < minXAD || XAD > maxXAD) {
      XAD_ERROR = Math.abs((XAD - minXAD) / XAD) * 100 + Math.abs((XAD - maxXAD) / XAD) * 100
    }

    const totalError = XAB_ERROR + ABC_ERROR + BCD_ERROR + XAD_ERROR
    if (totalError === 0) {
      return {
        ...xabcdPattern,
        error: totalError,
        type
      }
    }
    return null
  }

  public getHarmonics(klines: ICandle[]): IHarmonic[] {
    const values = klines.map((kline) => kline.close)
    const harmonics: IHarmonic[] = []

    from(this.peakDetector.findSignals(values))
      .pipe(
        map(this.toZigzags.bind({ klines })),
        toArray(),
        map(this.findXABCDCombinations.bind(this)), // bind the context to use `this.calcHarmonicRatios`
        mergeMap(({ zigzags, combinations }) => {
          const ratios = combinations.map((combination) => {
            const [XIndex, AIndex, BIndex, CIndex, DIndex] = combination
            const X = zigzags[XIndex]
            const A = zigzags[AIndex]
            const B = zigzags[BIndex]
            const C = zigzags[CIndex]
            const D = zigzags[DIndex]
            return this.calcHarmonicRatios(X, A, B, C, D)
          })

          for (const ratio of ratios) {
            for (const [key, value] of Object.entries(harmonicRatios)) {
              const harmonic = this.findHarmonics(key as HARMONIC_PATTERNS, ratio, value)
              if (harmonic !== null) {
                harmonics.push(harmonic)
              }
            }
          }

          return of(harmonics)
        })
      )
      .subscribe()

    return harmonics
  }
}
