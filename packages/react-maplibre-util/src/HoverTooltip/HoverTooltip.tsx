import React from 'react'
import { Flex, FlexProps } from '@orioro/react-ui-core'
import styled from 'styled-components'

type DataSectionProps = FlexProps & {
  title: string
  entries: [React.ReactNode, React.ReactNode][]
}

type HoverTooltipProps = {
  position: [number, number]
  children?: React.ReactNode
  dataSections?: DataSectionProps[]
  style?: React.CSSProperties
}

const Container = styled.div`
  pointer-events: none;
  position: absolute;
  z-index: 2;

  background-color: black;
  color: white;
  border-radius: 5px;
  font-size: 0.9rem;

  max-width: 300px;
`

const DataSectionHeading = styled.h3`
  margin: 0;
  line-height: 1.2;
  font-size: 1rem;
`

const DataSectionContainer = styled(Flex)`
  padding: 20px 15px;
`

const EntriesList = styled.ul`
  padding: 0;
  list-style: none;
  margin-bottom: 0;
  > li + li {
    margin-top: 4px;
  }
  // padding: 10px;
`

function DataSection({ title, entries, ...props }: DataSectionProps) {
  return (
    entries.length > 0 && (
      <DataSectionContainer direction="column" gap="10px" {...props}>
        <DataSectionHeading>{title}</DataSectionHeading>
        <EntriesList>
          {entries.map(([label, value], index) => (
            <li key={index}>
              {typeof label === 'string' ? <span>{label}: </span> : label}
              {typeof value === 'string' ? (
                <span
                  style={{
                    fontWeight: 'bold',
                  }}
                >
                  {value}
                </span>
              ) : (
                value
              )}
            </li>
          ))}
        </EntriesList>
      </DataSectionContainer>
    )
  )
}

export function HoverTooltip({
  position,
  children,
  dataSections,
  style = {},
}: HoverTooltipProps) {
  return (
    <Container
      style={{
        left: position[0] + 15,
        top: position[1] - 20,
        ...style,
      }}
    >
      {Array.isArray(dataSections) && dataSections.length > 0 && (
        <Flex direction="column">
          {dataSections.map((section, index) => (
            <React.Fragment key={index}>
              <DataSection {...section} />
              {index === dataSections.length - 1 ? null : (
                <div
                  style={{
                    width: '100%',
                    margin: 0,
                    borderBottom: '1px solid currentColor',
                    // marginBottom: 'none',
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </Flex>
      )}
      {children}
    </Container>
  )
}
