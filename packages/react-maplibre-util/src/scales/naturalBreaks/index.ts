import { ExpressionFn } from '@orioro/resolve/dist/resolvers/expressions/types'
import { ckmeans } from 'simple-statistics'
import { schemeYlOrRd } from 'd3-scale-chromatic'
import { MAX_K, MIN_K, autoK, within } from './autoK'
import { isPlainObject, pick } from 'lodash-es'

const DEFAULT_COLOR_SCALE = schemeYlOrRd

type ScaleNaturalBreaksProps = {
  propertyId: string
  values: number[]
  k?: number
  colorScale?: typeof DEFAULT_COLOR_SCALE
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
  propertyId,
  values,
  k,
  colorScale = DEFAULT_COLOR_SCALE,
}: ScaleNaturalBreaksProps) {
  try {
    values = values.filter((v) => typeof v === 'number' && !Number.isNaN(v))

    k = typeof k === 'number' ? within(k, [MIN_K, MAX_K]) : autoK(values)
    const bounds = naturalBreakBounds(values, k)

    const colors = colorScale[k]

    const expr = [
      'step',
      ['get', propertyId],

      ...bounds
        .map(([min, max], index) => {
          const color = colors[index]

          return index === 0 ? [color] : [min, color]
        })
        .flat(1),
    ]

    return expr
  } catch (err) {
    return '#cccccc'
  }
}

export const $scaleNaturalBreaks: ExpressionFn<
  [string, number[], opt?: Pick<ScaleNaturalBreaksProps, 'k' | 'colorScale'>]
> = ([propertyId, values, opt]) => {
  return scaleNaturalBreaks({
    propertyId,
    values,
    ...(isPlainObject(opt) ? pick(opt, ['colorScale', 'k']) : {}),
  })
}
