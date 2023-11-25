interface IYahooFinanceChartMeta {
  currency?: string
  symbol?: string
  exchangeName?: string
  instrumentType?: string
  firstTradeDate?: number
  regularMarketTime?: number
  gmtoffset?: number
  timezone?: string
  regularMarketPrice?: number
  exchangeTimezoneName?: string
  chartPreviousClose?: number
  priceHint?: number
  currentTradingPeriod?: {
    pre?: {
      timezone: string
      start: number
      end: number
      gmtoffset: number
    }
    regular?: {
      timezone: string
      start: number
      end: number
      gmtoffset: number
    }
    post?: {
      timezone: string
      start: number
      end: number
      gmtoffset: number
    }
  }
  range?: string
  validRanges?: string[]
  dataGranularity?: string
}

interface IYahooFinanceChartIndicators {
  quote?: [
    {
      low: number | null[]
      open: number | null[]
      volume: number | null[]
      high: number | null[]
      close: number | null[]
    }
  ]
  adjclose?: [
    {
      adjclose: number | null[]
    }
  ]
}

export interface IYahooFinanceChart {
  symbol?: string
  meta: IYahooFinanceChartMeta
  timestamp?: number[]
  indicators: IYahooFinanceChartIndicators
}

export interface IYahooFinanceChartResponse {
  symbol?: string
  chart: {
    result?: [IYahooFinanceChart]
    error?: {
      code?: string
      description?: string
    }
  }
}
