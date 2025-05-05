import React from 'react'
import { Flex, FlexProps } from '@orioro/react-ui-core'
import styled from 'styled-components'
import { LegendLayout, LegendLayoutProps } from '../LegendLayout'

export type ColorLegendItem = {
  id: string | number
  color: string
  label: React.ReactNode
  style?: React.CSSProperties
  boxStyle?: React.CSSProperties
  labelStyle?: React.CSSProperties
  [key: string]: any
}

export type ColorLegendProps = FlexProps &
  Omit<LegendLayoutProps, 'children'> & {
    description?: React.ReactNode
    items: ColorLegendItem[]
    size?: '1' | '2'
  }

const ColorDisplay = styled.div`
  background-color: var(--background-color);
  height: var(--color-legend-square-size, 20px);
  width: var(--color-legend-square-size, 20px);
`

const ItemLabel = styled.div`
  font-size: var(--color-legend-item-font-size, 0.9rem);
  line-height: 1.2;
  display: flex;
  align-items: center;
  cursor: default;
`

const STYLES_BY_SIZE = {
  '1': {
    '--color-legend-square-size': '14px',
    '--color-legend-item-font-size': '0.8rem',
  },
  '2': {
    '--color-legend-square-size': '20px',
    '--color-legend-item-font-size': '0.9rem',
  },
}

const ColorLegendItem = styled(Flex)`
  ${({ onMouseEnter, onClick, color }) => {
    return typeof onMouseEnter === 'function' || typeof onClick === 'function'
      ? `&:hover {
          text-decoration: underline;

          > div:first-child {
            outline: 1px solid var(--background-color);
          }
        `
      : ''
  }}
`

export function ColorLegendItems({
  items,
  size = '2',
  ...props
}: Omit<ColorLegendProps, 'title'>) {
  return (
    <Flex direction="column" gap="2px" {...props}>
      {items.map(
        (
          {
            label,
            id,
            color,
            style = {},
            boxStyle = {},
            labelStyle = {},
            ...props
          },
          index,
        ) => (
          <ColorLegendItem
            {...props}
            key={id || index}
            direction="row"
            alignItems="center"
            gap={size === '1' ? '8px' : '10px'}
            style={{
              ...STYLES_BY_SIZE[size],
              ...(style || {}),
              '--background-color': color,
            }}
          >
            <ColorDisplay
              style={{
                border:
                  color === 'transparent'
                    ? '1px dotted #555555'
                    : '1px solid var(--background-color)',
                ...(boxStyle || {}),
              }}
            />

            <ItemLabel style={labelStyle}>{label}</ItemLabel>
          </ColorLegendItem>
        ),
      )}
    </Flex>
  )
}

export function ColorLegend({
  title,
  unit,
  items,
  size,
  ...props
}: ColorLegendProps) {
  return (
    <LegendLayout title={title} unit={unit} {...props}>
      <ColorLegendItems items={items} size={size} />
    </LegendLayout>
  )
}
