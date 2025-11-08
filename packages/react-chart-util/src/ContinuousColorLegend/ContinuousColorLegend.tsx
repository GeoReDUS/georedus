import React, { useMemo } from 'react'
import { LegendLayout, type LegendLayoutProps } from '../LegendLayout'
import {
  colorsFromInterpolator,
  gradientFromColors,
  gradientFromInterpolator,
} from './util'
import { Flex } from '@orioro/react-ui-core'
import { fmtNumber } from '../util'

export type ContinuousColorLegendProps = LegendLayoutProps & {
  colors: string[] | ((value: number) => string)
  domain: [number, number]
  barDirection?: 'to top' | 'to bottom' | 'to left' | 'to right'
  ticks?: Record<
    number | string,
    {
      label: string
    }
  >
  barHeight?: number
  barWidth?: number
  numberFormat?: [string, Intl.NumberFormatOptions]
  unit?: string
}

export function ContinuousColorLegend({
  domain,
  colors,
  barDirection = 'to top',
  barHeight = 100,
  barWidth = 15,

  numberFormat,
  unit,

  ...layoutProps
}: ContinuousColorLegendProps) {
  const { barSize, valueAtStart, valueAtEnd } = useMemo(() => {
    const barSize =
      barDirection === 'to top' || barDirection === 'to bottom'
        ? barHeight
        : barWidth

    const [valueAtStart, valueAtEnd] =
      barDirection === 'to right' || barDirection === 'to bottom'
        ? domain
        : [domain[1], domain[0]]

    return {
      barSize,
      valueAtStart,
      valueAtEnd,
    }
  }, [barDirection, domain])

  const gradient = useMemo(
    () =>
      gradientFromColors({
        colors:
          typeof colors === 'function'
            ? colorsFromInterpolator({
                interpolator: colors,
                steps: barSize,
              })
            : colors,
        direction: barDirection,
      }),
    [colors, barDirection, barSize],
  )

  return (
    <LegendLayout {...layoutProps}>
      <Flex direction="row" gap="6px">
        <div
          style={{
            height: barHeight,
            width: barWidth,
            background: gradient,
          }}
        />
        <Flex justifyContent="space-between">
          <div
            style={{
              fontSize: '.8rem',
              whiteSpace: 'nowrap',
            }}
          >
            {fmtNumber(valueAtStart, {
              fmt: numberFormat,
              suffix: unit ? `${unit}` : '',
            })}
          </div>
          <div
            style={{
              fontSize: '.8rem',
              whiteSpace: 'nowrap',
            }}
          >
            {fmtNumber(valueAtEnd, {
              fmt: numberFormat,
              suffix: unit ? `${unit}` : '',
            })}
          </div>
        </Flex>
      </Flex>
    </LegendLayout>
  )
}
