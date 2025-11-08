import React from 'react'
import { Flex, FlexProps, mergeRender } from '@orioro/react-ui-core'
import styled from 'styled-components'
import { LegendLayout, LegendLayoutProps } from '../LegendLayout'

export type CategoricalLegendItem = {
  id: string | number
  color: string
  label: React.ReactNode
  style?: React.CSSProperties
  box?: Record<string, any>
  boxStyle?: React.CSSProperties
  boxChildren?: React.ReactNode
  labelStyle?: React.CSSProperties
  [key: string]: any
}

export type CategoricalLegendProps = FlexProps &
  Omit<LegendLayoutProps, 'children'> & {
    description?: React.ReactNode
    items: CategoricalLegendItem[]
    size?: '1' | '2'
  }

const ItemBox = styled.div<{
  $color?: string
}>`
  background-color: ${({ $color }) => $color || 'transparent'};
  height: var(--color-legend-square-size, 20px);
  width: var(--color-legend-square-size, 20px);

  border: ${({ $color }) =>
    $color === 'transparent'
      ? `1px dashed #555555`
      : `1px solid ${$color || 'transparent'}`};

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`

const ItemLabel = styled.div`
  font-size: var(--color-legend-item-font-size, 0.9rem);
  // line-height: 1.2;
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

const CategoricalLegendItem = styled(Flex)`
  ${({ onMouseEnter, onClick, color }) => {
    return typeof onMouseEnter === 'function' || typeof onClick === 'function'
      ? `&:hover {
          text-decoration: underline;

          > div:first-child {
            outline: 1px solid var(--color-legend-item-color);
          }
        `
      : ''
  }}
`

export function CategoricalLegendItems({
  items,
  size = '2',
  ...props
}: Omit<CategoricalLegendProps, 'title'>) {
  return (
    <Flex direction="column" gap="2px" {...props}>
      {items.map(
        (
          {
            label,
            id,
            color,
            style = {},
            box = {},
            boxStyle = {},
            boxChildren = null,
            labelStyle = {},
            ...props
          },
          index,
        ) => (
          <CategoricalLegendItem
            {...props}
            key={id || index}
            direction="row"
            alignItems="center"
            gap={size === '1' ? '8px' : '10px'}
            style={{
              ...STYLES_BY_SIZE[size],
              ...(style || {}),
              '--color-legend-item-color': color,
            }}
          >
            {mergeRender(
              ItemBox,
              {
                $color: color,
              },
              box,
            )}

            {mergeRender(ItemLabel, {}, label)}
          </CategoricalLegendItem>
        ),
      )}
    </Flex>
  )
}

export function CategoricalLegend({
  title,
  unit,
  items,
  size,
  ...props
}: CategoricalLegendProps) {
  return (
    <LegendLayout title={title} unit={unit} {...props}>
      <CategoricalLegendItems items={items} size={size} />
    </LegendLayout>
  )
}
