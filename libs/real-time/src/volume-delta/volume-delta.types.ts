export type VolumeData = {
  [interval: string]: { Buy: number; Sell: number }
}

export type VolumeStorage = {
  [symbol: string]: VolumeData
}
