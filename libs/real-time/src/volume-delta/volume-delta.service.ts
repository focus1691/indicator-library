import { Injectable } from '@nestjs/common'
import { Cron, Interval } from '@nestjs/schedule'
import { INTERVALS } from '@utils/constants/candlesticks'
import { ISymbols } from '@exchanges/exchanges.types'
import { BinanceWebSocketService } from '@exchanges/binance/BinanceWebsocketService'
import { BybitWebSocketService } from '@exchanges/bybit/BybitWebsocketService'
import { TradeData as BybitTradeData } from '@exchanges/bybit/websocket.responses'
import { VolumeStorage } from '@real-time/volume-delta/volume-delta.types'
import * as os from 'os'

const intervals: string[] = [
  INTERVALS.FIVE_MINUTES,
  INTERVALS.FIFTEEN_MINUTES,
  INTERVALS.THIRTY_MINUTES,
  INTERVALS.ONE_HOUR,
  INTERVALS.FOUR_HOURS,
  INTERVALS.ONE_DAY
]

const symbols = {
  BTCUSDT: 'Bitcoin',
  ETHUSDT: 'Ethereum',
  XRPUSDT: 'Ripple',
  BCHUSDT: 'Bitcoin Cash',
  LTCUSDT: 'Litecoin',
  DOTUSDT: 'Polkadot',
  ADAUSDT: 'Cardano',
  LINKUSDT: 'Chainlink',
  XLMUSDT: 'Stellar Lumens',
  EOSUSDT: 'EOS',
  TRXUSDT: 'TRON',
  DOGEUSDT: 'Dogecoin',
  XMRUSDT: 'Monero',
  DASHUSDT: 'Dash',
  ZECUSDT: 'Zcash',
  XTZUSDT: 'Tezos',
  VETUSDT: 'VeChain',
  MKRUSDT: 'Maker',
  OMGUSDT: 'OMG Network',
  DCRUSDT: 'Decred',
  ZILUSDT: 'Zilliqa',
  WAVESUSDT: 'Waves',
  NANOUSDT: 'Nano',
  BATUSDT: 'Basic Attention Token',
  QTUMUSDT: 'Qtum',
  RVNUSDT: 'Ravencoin',
  ONTUSDT: 'Ontology',
  ALGOUSDT: 'Algorand',
  ENJUSDT: 'Enjin Coin',
  IOSTUSDT: 'IOST',
  STMXUSDT: 'StormX',
  CELRUSDT: 'Celer Network',
  RENUSDT: 'Ren',
  SRMUSDT: 'Serum',
  UNIUSDT: 'Uniswap',
  COMPUSDT: 'Compound',
  YFIUSDT: 'Yearn.finance',
  AAVEUSDT: 'AAVE',
  SNXUSDT: 'Synthetix',
  CRVUSDT: 'Curve DAO Token'
} as ISymbols

@Injectable()
export class VolumeDeltaService {
  private bybitVolume: VolumeStorage = {}
  private binanceVolume: VolumeStorage = {}

  constructor(private readonly bybitWsService: BybitWebSocketService, private readonly binanceWsService: BinanceWebSocketService) {}

  async onModuleInit() {
    const bybitSymbols = Object.keys(symbols)
    const binanceSymbols = Object.keys(symbols)

    const topics: string[] = bybitSymbols.map((symbol: string) => `publicTrade.${symbol}`)
    this.bybitWsService.subscribeToTopics(topics, 'linear')

    for (const symbol of bybitSymbols) {
      this.bybitVolume[symbol] = {}
      intervals.forEach((interval) => {
        this.bybitVolume[symbol][interval] = { Buy: 0, Sell: 0 }
      })
    }

    for (const symbol of binanceSymbols) {
      this.binanceVolume[symbol] = {}
      intervals.forEach((interval) => {
        this.binanceVolume[symbol][interval] = { Buy: 0, Sell: 0 }
        this.binanceWsService.subscribeToTrades(symbol, 'usdm')
      })
    }

    this.bybitWsService.tradeUpdates.subscribe((trades: BybitTradeData[]) => {
      for (let i = 0; i < trades.length; i++) {
        intervals.forEach((interval) => {
          this.bybitVolume[trades[i].s][interval][trades[i].S] += Number(trades[i].v)
        })
      }
    })

    this.binanceWsService.tradeUpdates.subscribe((trade) => {
      intervals.forEach((interval) => {
        this.binanceVolume[trade.s][interval][trade.m ? 'Buy' : 'Sell'] += Number(trade.q)
      })
    })
  }

  private getSystemUsage() {
    // CPU usage
    const freeCpu = os.freemem()
    const totalCpu = os.totalmem()
    const cpuUsage = ((totalCpu - freeCpu) / totalCpu) * 100

    // Memory usage
    const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024

    console.log(`CPU Usage: ${cpuUsage.toFixed(2)}%`)
    console.log(`Memory Usage: ${usedMemory.toFixed(2)} MB`)
  }

  @Interval(1000 * 30) // Every 30 seconds
  logSystemUsage() {
    this.getSystemUsage()
  }

  @Cron('*/5 * * * *') // Every 5 minutes
  calculateAndReset5mVolumeDelta() {
    this.calculateAndResetVolumeDelta(INTERVALS.FIVE_MINUTES)
  }

  @Cron('*/15 * * * *') // Every 15 minutes
  calculateAndReset15mVolumeDelta() {
    this.calculateAndResetVolumeDelta(INTERVALS.FIFTEEN_MINUTES)
  }

  @Cron('*/30 * * * *') // Every 30 minutes
  calculateAndReset30mVolumeDelta() {
    this.calculateAndResetVolumeDelta(INTERVALS.THIRTY_MINUTES)
  }

  @Cron('0 * * * *') // Every 1 hour
  calculateAndReset1hVolumeDelta() {
    this.calculateAndResetVolumeDelta(INTERVALS.ONE_HOUR)
  }

  @Cron('0 */4 * * *') // Every 4 hours
  calculateAndReset4hVolumeDelta() {
    this.calculateAndResetVolumeDelta(INTERVALS.FOUR_HOURS)
  }

  @Cron('0 0 * * *') // Every 24 hours (1 day)
  calculateAndReset1dVolumeDelta() {
    this.calculateAndResetVolumeDelta(INTERVALS.ONE_DAY)
  }

  private calculateAndResetVolumeDelta(interval: string) {
    for (const symbol in this.bybitVolume) {
      if (this.bybitVolume[symbol][interval]) {
        const bybitDelta = this.bybitVolume[symbol][interval].Buy - this.bybitVolume[symbol][interval].Sell
        console.log(`Bybit Volume Delta for ${symbol} [${interval}]: ${bybitDelta}`)

        // Cache the delta value before resetting

        this.bybitVolume[symbol][interval] = { Buy: 0, Sell: 0 }
      }
    }

    for (const symbol in this.binanceVolume) {
      if (this.binanceVolume[symbol][interval]) {
        const binanceDelta = this.binanceVolume[symbol][interval].Buy - this.binanceVolume[symbol][interval].Sell
        console.log(`Binance Volume Delta for ${symbol} (${interval}): ${binanceDelta}`)

        // Cache the delta value before resetting

        this.binanceVolume[symbol][interval] = { Buy: 0, Sell: 0 }
      }
    }
  }
}
