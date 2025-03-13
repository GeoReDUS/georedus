import React from 'react'
import { Flex, FlexProps } from '@orioro/react-ui-core'
import styled from 'styled-components'
import { LegendLayout, LegendLayoutProps } from '../LegendLayout'

export type ColorLegendItem = {
  id: string | number
  color: string
  label: React.ReactNode
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

export function ColorLegendItems({
  items,
  size = '2',
  ...props
}: Omit<ColorLegendProps, 'title'>) {
  console.log({
    size,
  })

  return (
    <Flex direction="column" gap="2px" {...props}>
      {items.map((item, index) => (
        <Flex
          key={item.id || index}
          direction="row"
          alignItems="center"
          gap={size === '1' ? '8px' : '10px'}
          style={{
            ...STYLES_BY_SIZE[size],
            '--background-color': item.color,
          }}
        >
          <ColorDisplay
            style={{
              border:
                item.color === 'transparent'
                  ? '1px dotted #555555'
                  : '1px solid var(--background-color)',
            }}
          />

          <ItemLabel>{item.label}</ItemLabel>
        </Flex>
      ))}
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
