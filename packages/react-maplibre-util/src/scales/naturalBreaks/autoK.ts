import { ckmeans } from 'simple-statistics'
import { range, variance, sum, maxIndex } from 'd3'

export const DEFAULT_MIN_K = 3
export const DEFAULT_MAX_K = 9

//
// https://observablehq.com/@visionscarto/natural-breaks
//
export const elbowiness = (
  numbers: number[],
  [minK, maxK]: [number, number],
) => {
  const intrass = [
    null, // skip k = 0 // TODO: improve
    ...range(1, maxK + 1).map((k) =>
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
  [minK, maxK]: [number, number] = [DEFAULT_MIN_K, DEFAULT_MAX_K],
) =>
  within(
    maxIndex(
      elbowiness(numbers, [minK, maxK]),
      (score, k) => score / (1 + Math.sqrt(k)),
    ),
    [minK, maxK],
  )
