import { ExpressionFn } from '@orioro/resolve/dist/resolvers/expressions/types'
import { ckmeans } from 'simple-statistics'
import { schemeYlOrRd } from 'd3-scale-chromatic'
import { DEFAULT_MAX_K, DEFAULT_MIN_K, autoK, within } from './autoK'
import { isPlainObject, pick } from 'lodash-es'
// import greenlet from 'greenlet'

const DEFAULT_COLOR_SCALE = schemeYlOrRd

export type ScaleNaturalBreaksProps = {
  values: number[]
  k?: number
  defaultColor?: string
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

const DEFAULT_COLOR = 'transparent'

export function scaleNaturalBreaks({
  values,
  k,
  defaultColor = DEFAULT_COLOR,
  minK = DEFAULT_MIN_K,
  maxK = DEFAULT_MAX_K,
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
        const color = scale[index]

        return index === 0 ? [defaultColor, min, color] : [min, color]
      })
      .flat(1)

    return steps
  } catch (err) {
    console.error(err)

    return null
  }
}

export const $naturalBreaks: ExpressionFn<
  [number[], opt?: Pick<ScaleNaturalBreaksProps, 'k' | 'scalesByK'>]
> = ([values, opt]) => {
  const breaks = scaleNaturalBreaks({
    values,
    ...(isPlainObject(opt)
      ? pick(opt, ['scalesByK', 'k', 'minK', 'maxK'])
      : {}),
  })

  return breaks
}
