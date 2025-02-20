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
  }

const ColorDisplay = styled.div`
  background-color: var(--background-color);
  height: 20px;
  width: 20px;
`

const ItemLabel = styled.div`
  font-size: 0.9rem;
  display: flex;
  align-items: center;
`

export function ColorLegendItems({
  items,
  ...props
}: Omit<ColorLegendProps, 'title'>) {
  return (
    <Flex direction="column" gap="2px" {...props}>
      {items.map((item, index) => (
        <Flex
          key={item.id || index}
          direction="row"
          alignItems="strecth"
          gap="10px"
        >
          <ColorDisplay
            style={{
              '--background-color': item.color,
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
  ...props
}: ColorLegendProps) {
  return (
    <LegendLayout title={title} unit={unit} {...props}>
      <ColorLegendItems items={items} />
    </LegendLayout>
  )
}
