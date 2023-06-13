import { KlineInterval, numberInString } from 'binance'

export interface KlineResponse {
  e: string // Event type
  E: number // Event time
  s: string // Symbol
  k: KlineData // Kline details
}

export interface KlineData {
  t: number
  T: number
  s: string
  i: KlineInterval
  f: number
  L: number
  o: numberInString
  c: numberInString
  h: numberInString
  l: numberInString
  v: numberInString
  n: number
  x: boolean
  q: numberInString
  V: numberInString
  Q: numberInString
  B: numberInString
}

export interface TradeData {
  e: 'trade';
  E: number;
  s: string;
  t: number;
  p: numberInString;
  q: numberInString;
  b: number;
  a: number;
  T: number;
  m: boolean;
  M: boolean;
}
