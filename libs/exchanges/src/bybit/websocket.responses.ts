export interface KlineResponse {
  topic: string;
  type: string;
  ts: number;
  data: KlineData[];
}

export interface KlineData {
  start: number;
  end: number;
  interval: string;
  open: string;
  close: string;
  high: string;
  low: string;
  volume: string;
  turnover: string;
  confirm: boolean;
  timestamp: number;
}

export interface TradeResponse {
  topic: string;
  type: string;
  ts: number;
  data: TradeData[];
}

export interface TradeData {
  T: number; // timestamp
  s: string; // symbol
  S: string; // side (Buy/Sell)
  v: string; // volume
  p: string; // price
  L: string; // tick direction
  i: string; // trade id
  BT: boolean; // breakout trade
}
