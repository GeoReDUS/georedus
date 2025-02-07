import { ExpressionFn } from '@orioro/resolve/dist/resolvers/expressions/types'
import { ckmeans } from 'simple-statistics'
import { schemeYlOrRd } from 'd3-scale-chromatic'
import { MAX_K, MIN_K, autoK, within } from './autoK'
import { isPlainObject, pick } from 'lodash-es'

const DEFAULT_COLOR_SCALE = schemeYlOrRd

type ScaleNaturalBreaksProps = {
  values: number[]
  k?: number
  minK?: number
  maxK?: number
  scalesByK?: typeof DEFAULT_COLOR_SCALE
}

export function naturalBreakBounds(
  values: number[],
  k: number,
): [number, number][] {
  const groups = ckmeans(values, k)
  const bounds = groups.map(
    (group) => [group[0], group[group.length - 1]] as [number, number],
  )
  return bounds
}

export function scaleNaturalBreaks({
  values,
  k,
  minK = MIN_K,
  maxK = MAX_K,
  scalesByK = DEFAULT_COLOR_SCALE,
}: ScaleNaturalBreaksProps) {
  try {
    values = values.filter((v) => typeof v === 'number' && !Number.isNaN(v))

    k =
      typeof k === 'number'
        ? within(k, [minK, maxK])
        : autoK(values, [minK, maxK])
    const bounds = naturalBreakBounds(values, k)

    const scale = scalesByK[k]

    //
    // Will produce an array such as:
    // [
    //   "below_10",
    //   10,
    //   "between_10_20",
    //   20,
    //   "between_20_30",
    //   30,
    //   "above_30"
    // ]
    //
    const steps = bounds
      .map(([min, max], index) => {
        const scaleValue = scale[index]

        return index === 0 ? [scaleValue] : [min, scaleValue]
      })
      .flat(1)

    return steps
  } catch (err) {
    return '#cccccc'
  }
}

export const $naturalBreaks: ExpressionFn<
  [number[], opt?: Pick<ScaleNaturalBreaksProps, 'k' | 'scalesByK'>]
> = ([values, opt]) => {
  return scaleNaturalBreaks({
    values,
    ...(isPlainObject(opt) ? pick(opt, ['scalesByK', 'k']) : {}),
  })
}
