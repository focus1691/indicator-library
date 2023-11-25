export const calculateSMA = (data: number[]) => {
  const sma: number =
    data.reduce((acc, curr) => {
      return acc + curr
    }, 0) / data.length
  return sma
}

export const calculateHighLow = (data: number[]) => {
  const high: number = Math.max(...data)
  const low: number = Math.min(...data)
  return { high, low }
}
