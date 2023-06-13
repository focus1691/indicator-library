import { Injectable } from '@nestjs/common'
import { Observable, Subject } from 'rxjs'
import { WebsocketClient, WsMessageKlineRaw, WsMessageTradeRaw } from 'binance'
import { KlineIntervals } from '@exchanges/binance/types'
import { KlineData, TradeData } from '@exchanges/binance/websocket.responses'

@Injectable()
export class BinanceWebSocketService {
  private ws: WebsocketClient
  private klineUpdates$: Subject<KlineData> = new Subject()
  private tradeUpdates$: Subject<TradeData> = new Subject()

  constructor() {
    this.initWebSocket()
  }

  get klineUpdates(): Observable<KlineData> {
    return this.klineUpdates$.asObservable()
  }

  get tradeUpdates(): Observable<TradeData> {
    return this.tradeUpdates$.asObservable()
  }

  private initWebSocket(): void {
    this.ws = new WebsocketClient({})

    this.ws.on('message', (message: WsMessageKlineRaw | WsMessageTradeRaw) => {
      if (message.e === 'kline') {
        this.klineUpdates$.next(message.k)
      } else if (message.e === 'trade') {
        this.tradeUpdates$.next(message as TradeData)
      }
    })
    this.ws.on('open', (data) => {
      console.log('connection opened:', data.wsKey, data.ws.target.url)
    })

    this.ws.on('reconnecting', (data) => {
      console.log('ws automatically reconnecting.... ', data?.wsKey)
    })

    this.ws.on('reconnected', (data) => {
      console.log('ws has reconnected ', data?.wsKey)
    })

    this.ws.on('error', (data) => {
      console.log('ws saw error ', data?.wsKey)
    })
  }

  public subscribeToKlines(symbol: string, interval: KlineIntervals, market: 'spot' | 'usdm' | 'coinm'): void {
    this.ws.subscribeKlines(symbol, interval, market)
  }

  public subscribeToTrades(symbol: string, market: 'spot' | 'usdm' | 'coinm'): void {
    this.ws.subscribeTrades(symbol, market)
  }
}
