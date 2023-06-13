import { Injectable } from '@nestjs/common'
import { Observable, Subject } from 'rxjs'
import { wsConfig } from '@exchanges/bybit/websocket'
import { KlineData, TradeData, KlineResponse, TradeResponse } from '@exchanges/bybit/websocket.responses'
import { WebsocketClient, CategoryV5 } from 'bybit-api'

@Injectable()
export class BybitWebSocketService {
  private ws: WebsocketClient
  private klineUpdates$: Subject<KlineData[]> = new Subject()
  private tradeUpdates$: Subject<TradeData[]> = new Subject()

  constructor() {
    this.initWebSocket()
  }

  get klineUpdates(): Observable<KlineData[]> {
    return this.klineUpdates$.asObservable()
  }

  get tradeUpdates(): Observable<TradeData[]> {
    return this.tradeUpdates$.asObservable()
  }

  private initWebSocket(): void {
    this.ws = new WebsocketClient(wsConfig)
    this.ws.on('update', (response: KlineResponse | TradeResponse) => {
      if (response.topic.startsWith('kline')) {
        this.klineUpdates$.next(response.data as KlineData[])
      } else if (response.topic.startsWith('publicTrade')) {
        this.tradeUpdates$.next(response.data as TradeData[])
      }
    })
  }

  public subscribeToTopics(topics: string[], category: string): void {
    // topics = ['kline.5.BTCUSDT', 'kline.5.ETHUSDT']
    // category = 'linear'
    this.ws.subscribeV5(topics, category as CategoryV5)
  }
}
