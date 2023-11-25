import { IZigZag } from '@technical-analysis/range/range.types'

export interface IHarmonic extends IXABCDPattern {
  type: HARMONIC_PATTERNS
}

export interface IXABCDPattern {
  X: IZigZag
  A: IZigZag
  B: IZigZag
  C: IZigZag
  D: IZigZag
  XAB: number
  ABC: number
  BCD: number
  XAD: number
  error?: number
}

export interface IXABCDRatio {
  XAB: number[]
  ABC: number[]
  BCD: number[]
  XAD: number[]
}

export const BAT_RATIOS: IXABCDRatio = {
  XAB: [0.382, 0.50],
  ABC: [0.382, 0.886],
  BCD: [1.618, 2.618],
  XAD: [0.886, 0.886]
}

export const GARTLEY_RATIOS: IXABCDRatio = {
  XAB: [0.618, 0.618],
  ABC: [0.382, 0.886],
  BCD: [1.13, 1.618],
  XAD: [0.786, 0.786]
}

export const BUTTERFLY_RATIOS: IXABCDRatio = {
  XAB: [0.786, 0.786],
  ABC: [0.50, 0.886],
  BCD: [1.618, 2.24],
  XAD: [1.27, 1.27]
}

export const CRAB_RATIOS: IXABCDRatio = {
  XAB: [0.382, 0.886],
  ABC: [0.382, 0.886],
  BCD: [2.618, 3.618],
  XAD: [1.618, 1.618]
}

export const DEEP_CRAB_RATIOS: IXABCDRatio = {
  XAB: [0.886, 0.886],
  ABC: [0.382, 0.886],
  BCD: [2.0, 3.618],
  XAD: [1.618, 1.618]
}

export const CYPHER_RATIOS: IXABCDRatio = {
  XAB: [0.382, 0.618],
  ABC: [1.13, 1.41],
  BCD: [1.272, 2.0],
  XAD: [1.13, 1.414]
}

export const SHARK_RATIOS: IXABCDRatio = {
  XAB: [1.13, 1.618],
  ABC: [1.13, 1.13],
  BCD: [0.50, 0.50],
  XAD: [0.886, 1.13]
}

export enum HARMONIC_PATTERNS {
  BAT = 'bat',
  GARTLEY = 'gartley',
  BUTTERFLY = 'butterfly',
  CRAB = 'crab',
  DEEP_CRAB = 'deep_crab',
  CYPHER = 'cypher',
  SHARK = 'shark'
}

export const harmonicRatios = {
  [HARMONIC_PATTERNS.BAT]: BAT_RATIOS,
  [HARMONIC_PATTERNS.GARTLEY]: GARTLEY_RATIOS,
  [HARMONIC_PATTERNS.BUTTERFLY]: BUTTERFLY_RATIOS,
  [HARMONIC_PATTERNS.CRAB]: CRAB_RATIOS,
  [HARMONIC_PATTERNS.DEEP_CRAB]: DEEP_CRAB_RATIOS,
  [HARMONIC_PATTERNS.CYPHER]: CYPHER_RATIOS,
  [HARMONIC_PATTERNS.SHARK]: SHARK_RATIOS
}
