import { normaliseInterval } from '@exchanges/utils/normaliser'

interface EnumSuffixFilters {
  minutes?: boolean
  hours?: boolean
  days?: boolean
  weeks?: boolean
  months?: boolean
}

export function filterEnumValuesBySuffix<T extends { [key: string]: string }>(enumObj: T, filters: EnumSuffixFilters = {}): string[] {
  const enumValues = Object.values(enumObj) as string[]
  const filteredValues: string[] = []
  for (const interval of enumValues) {
    const normalisedInterval = normaliseInterval(interval)
    const suffix = normalisedInterval.slice(-1)
    const match =
      (suffix === 'm' && filters.minutes) ||
      (suffix === 'h' && filters.hours) ||
      (suffix === 'd' && filters.days) ||
      (suffix === 'w' && filters.weeks) ||
      (suffix === 'M' && filters.months)
    if (match) {
      filteredValues.push(interval)
    }
  }
  return filteredValues
}
