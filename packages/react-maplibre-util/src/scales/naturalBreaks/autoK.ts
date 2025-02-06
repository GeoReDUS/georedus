import { ckmeans } from 'simple-statistics'
import { range, variance, sum, maxIndex } from 'd3'

export const MIN_K = 3
export const MAX_K = 9

//
// https://observablehq.com/@visionscarto/natural-breaks
//
export const elbowiness = (numbers: number[]) => {
  const intrass = [
    null, // skip k = 0 // TODO: improve
    ...range(1, MAX_K + 1).map((k) =>
      k === 1
        ? variance(numbers)
        : sum(ckmeans(numbers, k), (v) => variance(v)),
    ),
  ]

  return range(0, intrass.length - 1).map((k) =>
    k < 2
      ? NaN
      : Math.log(intrass[k - 1] as number) +
        Math.log(intrass[k + 1] as number) -
        2 * Math.log(intrass[k] as number),
  )
}

export function within(value: number, [min, max]: [number, number]) {
  return Math.max(min, Math.min(max, value))
}

export const autoK = (
  numbers: number[],
  [min, max]: [number, number] = [MIN_K, MAX_K],
) =>
  within(
    maxIndex(elbowiness(numbers), (score, k) => score / (1 + Math.sqrt(k))),
    [min, max],
  )
