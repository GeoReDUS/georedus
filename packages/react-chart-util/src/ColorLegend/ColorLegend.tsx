import React from 'react'
import { Flex, FlexProps } from '@orioro/react-ui-core'
import styled from 'styled-components'

export type ColorLegendItem = {
  id: string | number
  color: string
  label: React.ReactNode
}

export type ColorLegendProps = FlexProps & {
  title?: React.ReactNode
  unit?: React.ReactNode
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
`

const LegendTitle = styled.h3`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1;
`

const LegendUnit = styled.span`
  font-size: .8rem;
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
          alignItems="center"
          gap="10px"
        >
          <ColorDisplay
            style={{
              '--background-color': item.color,
            }}
          />

          <ItemLabel>{item.label}</ItemLabel>
        </Flex>
      ))}
    </Flex>
  )
}

export function ColorLegend({ title, unit, ...props }: ColorLegendProps) {
  return (
    <Flex direction="column" gap="6px">
      {(title || unit) && (
        <div>
          {title && <LegendTitle>{title}</LegendTitle>}
          {unit && <LegendUnit>({unit})</LegendUnit>}
        </div>
      )}
      <ColorLegendItems {...props} />
    </Flex>
  )
}
