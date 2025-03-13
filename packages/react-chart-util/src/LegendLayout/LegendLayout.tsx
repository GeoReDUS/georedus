import React from 'react'
import { Flex, FlexProps } from '@orioro/react-ui-core'
import styled from 'styled-components'

const LegendTitle = styled.h3`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.3;
`

const LegendUnit = styled.span`
  font-size: 0.8rem;
`

export type LegendLayoutProps = FlexProps & {
  title?: React.ReactNode
  unit?: React.ReactNode
  children?: React.ReactNode
}

export function LegendLayout({
  title,
  unit,
  children,
  direction = 'column',
  ...props
}: LegendLayoutProps) {
  return (
    <Flex direction={direction} gap="10px" maxWidth="300px" {...props}>
      {(title || unit) && (
        <div
          style={{
            maxWidth: direction === 'row' ? '50%' : 'none',
          }}
        >
          {title && <LegendTitle>{title}</LegendTitle>}
          {unit && <LegendUnit>({unit})</LegendUnit>}
        </div>
      )}
      <Flex
        direction="column"
        justifyContent="center"
        style={{
          flexGrow: 1,
        }}
      >
        {children}
      </Flex>
    </Flex>
  )
}
