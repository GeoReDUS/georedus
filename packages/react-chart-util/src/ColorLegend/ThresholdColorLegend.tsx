import { chunk } from 'lodash-es'
import { ColorLegend, ColorLegendProps } from './ColorLegend'
import { interpolate } from '@orioro/util'
import React, { useMemo } from 'react'
import { cast, CastNumberToStrOptions } from '@orioro/cast'

type Color = string
type Threshold = number
type StepsInput = (Color | Threshold)[]

type FormatOptions = {
  below: null | string | ((max: string) => React.ReactNode)
  above: null | string | ((min: string) => React.ReactNode)
  between: string | ((min: string, max: string) => React.ReactNode)
  number: CastNumberToStrOptions
}

type ThresholdColorLegendProps = Omit<ColorLegendProps, 'items'> & {
  steps: StepsInput
  format?: Partial<FormatOptions>
}

type ParsedStepItem = {
  min?: number
  minStr?: string
  max?: number
  maxStr?: string
  color: string
  label: string
}
const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
  below: 'Abaixo de ${0}',
  above: 'Acima de ${0}',
  between: '${0} - ${1}',
  number: [undefined, {}],
}

export function parseStepsToItems(
  steps: StepsInput,
  options: FormatOptions = DEFAULT_FORMAT_OPTIONS,
): ParsedStepItem[] {
  options = {
    ...DEFAULT_FORMAT_OPTIONS,
    ...options,
  }
  const [defaultColor, ...rest] = steps

  const castOptions = {
    type: 'string',
    number: options.number,
  }

  const _cast = cast.bind(null, castOptions)

  const defaultMax = rest[0]
  const defaultMaxStr = _cast(defaultMax)

  return [
    {
      color: defaultColor,
      max: defaultMax,
      maxStr: defaultMaxStr,
      label:
        typeof options.below === 'string'
          ? interpolate(options.below, defaultMaxStr)
          : typeof options.below === 'function'
            ? options.below(defaultMaxStr)
            : options.below,
    } as ParsedStepItem,
    ...chunk(rest, 2).map(([min, color], index, arr) => {
      const minStr = _cast(min)
      const maxStr = index < arr.length - 1 ? _cast(arr[index + 1][0]) : null

      return {
        min,
        minStr,
        maxStr,
        color,
        label:
          index < arr.length - 1
            ? typeof options.between === 'string'
              ? interpolate(options.between, [minStr, maxStr])
              : options.between(minStr, maxStr)
            : typeof options.above === 'string'
              ? interpolate(options.above, minStr)
              : typeof options.above === 'function'
                ? options.above(minStr)
                : options.above,
      } as ParsedStepItem
    }),
  ].reverse()
}

export type ParsedStepThresholds = {
  value: number
  color: string
}

export function SequentialColorLegend({
  format,
  steps,
  ...props
}: ThresholdColorLegendProps) {
  const items = useMemo(() => parseStepsToItems(steps, format), [steps])

  return <ColorLegend items={items} {...props} />
}

export function ThresholdColorLegend({
  steps,
  format,
  ...props
}: ThresholdColorLegendProps) {
  const items = useMemo(() => {
    const parsed = parseStepsToItems(steps, format)

    return parsed.map((item, index, all) =>
      index === all.length - 1
        ? {
            ...item,
            label: null,
          }
        : {
            ...item,
            label: (
              <div
                style={{
                  transform: 'translateY(calc(50% + 1px))',
                  // background: 'steelblue',
                }}
              >
                {item.minStr}
              </div>
            ),
          },
    )
  }, [steps])

  return <ColorLegend items={items} {...props} />
}
