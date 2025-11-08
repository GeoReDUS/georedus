import React, { useCallback } from 'react'
import { Debug } from '@orioro/react-ui-core'
import { scaleLinear } from 'd3-scale'
import { range } from 'lodash-es'
import { useMemo } from 'react'
import { LegendLayout, LegendLayoutProps } from '../LegendLayout'
import styled from 'styled-components'
import { fmtNumber } from '../util'

export type ProportionalSymbolLegendProps = Omit<
  LegendLayoutProps,
  'children'
> & {
  labelWidth?: number
  sizeMin?: number
  sizeMax?: number

  min: number
  max: number
  steps?: number
  numberFormat?: [string, Intl.NumberFormatOptions]
  labelUnit?: string
}

const Container = styled.div`
  padding-right: calc(var(--proportional-symbol-legend-label-width) + 10px);
  // background-color: green;
`

//
// All positioning is relative to this container
//
const PositionContainer = styled.div`
  position: relative;
  box-sizing: border-box;
  // background-color: red;
`

const CircleSymbol = styled.div`
  z-index: 2;
  box-sizing: border-box;
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 100%;

  border: 1px solid black;

  width: var(--proportional-symbol-legend-item-size);
  height: var(--proportional-symbol-legend-item-size);
`

const CircleLabel = styled.div`
  z-index: 1;
  font-size: 0.7rem;
  position: absolute;

  bottom: var(--proportional-symbol-legend-item-size);
  left: calc(100% + 10px);

  transform: translateY(70%);

  width: var(--proportional-symbol-legend-label-width);
  // background-color: blue;
  text-align: right;
  white-space: nowrap;

  &::before {
    position: absolute;
    content: '';
    display: block;
    width: calc((var(--proportional-symbol-legend-max-size) / 2) + 5px);
    border-bottom: 1px dotted #555555;
    right: calc(100% + 5px);
    bottom: calc(70% - 1px);
  }
`

function Circle({
  style,
  label,
}: {
  style: React.CSSProperties
  label: React.ReactNode
}) {
  return (
    <div style={style}>
      <CircleSymbol></CircleSymbol>
      <CircleLabel>{label}</CircleLabel>
    </div>
  )
}

const DEFAULT_SIZE_MAX = 60
const DEFAULT_SIZE_MIN = 15

export function ProportionalSymbolLegendItems({
  labelWidth = 20,
  sizeMax = DEFAULT_SIZE_MAX,
  sizeMin = DEFAULT_SIZE_MIN,

  min,
  max,
  steps = 4,

  numberFormat,
  labelUnit,
}: ProportionalSymbolLegendProps) {
  const sizeScale = useMemo(
    () => scaleLinear([sizeMin, sizeMax]).domain([0, steps - 1]),
    [sizeMin, sizeMax, steps],
  )

  const valueScale = useMemo(
    () => scaleLinear([min, max]).domain([0, steps - 1]),
    [min, max, steps],
  )

  const items = useMemo(() => {
    return range(0, steps)
      .reverse()
      .map((step) => ({
        size: sizeScale(step),
        value: valueScale(step),
        label: fmtNumber(valueScale(step), {
          fmt: numberFormat,
          suffix: labelUnit ? ` ${labelUnit}` : '',
        }),
      }))
  }, [steps, numberFormat, valueScale, sizeScale])

  return (
    <Container
      style={{
        '--proportional-symbol-legend-label-width': `${labelWidth}px`,
      }}
    >
      <PositionContainer
        style={{
          '--proportional-symbol-legend-max-size': `${sizeMax}px`,
          width: sizeMax,
          height: sizeMax,
        }}
      >
        {items.map((item) => (
          <Circle
            key={item.value}
            style={{
              '--proportional-symbol-legend-item-size': `${item.size}px`,
            }}
            label={item.label}
          />
        ))}
      </PositionContainer>
    </Container>
  )
}

export function ProportionalSymbolLegend({
  title,
  unit,
  style,
  maxWidth,
  maxHeight,
  ...props
}: ProportionalSymbolLegendProps) {
  return (
    <LegendLayout
      title={title}
      unit={unit}
      style={style}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
    >
      <ProportionalSymbolLegendItems {...props} />
    </LegendLayout>
  )
}
