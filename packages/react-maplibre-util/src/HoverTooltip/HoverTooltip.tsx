import React, { useMemo, useRef } from 'react'
import { useState, useCallback, useLayoutEffect } from 'react'

import { Flex, FlexProps } from '@orioro/react-ui-core'
import styled from 'styled-components'
import { usePrevious } from 'react-use'

type DataSectionProps = FlexProps & {
  title?: string
  entries?: [React.ReactNode, React.ReactNode][]
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

  background: rgba(0, 0, 0, 0.5);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(0, 0, 0, 0.3);

  // background-color: black;
  color: white;
  border-radius: 5px;
  font-size: 0.9rem;

  max-width: 300px;

  hyphens: auto;
  word-break: break-word; /* Avoids overflow */
  overflow-wrap: break-word; /* Ensures long words break */
  white-space: normal;
`

const DataSectionHeading = styled.h3`
  margin: 0;
  line-height: 1.2;
  font-size: 1rem;
`

const DataSectionContainer = styled(Flex)`
  padding: 15px 10px;
`

const EntriesList = styled.ul`
  padding: 0;
  list-style: none;
  margin-top: 0;
  margin-bottom: 0;
  > li + li {
    margin-top: 4px;
  }
`

function _notEmpty(value: any) {
  return typeof value !== 'undefined' && value !== null && value !== ''
}

function DataSection({ title, entries, ...props }: DataSectionProps) {
  return (
    Array.isArray(entries) &&
    entries.length > 0 && (
      <DataSectionContainer direction="column" gap="10px" {...props}>
        {title && <DataSectionHeading>{title}</DataSectionHeading>}
        <div>
          <EntriesList>
            {entries.map(([label, value], index) => (
              <li key={index}>
                {typeof label === 'string' ? (
                  <span>{`${label}${_notEmpty(value) ? ': ' : ''}`}</span>
                ) : (
                  label
                )}
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
        </div>
      </DataSectionContainer>
    )
  )
}

function useMaxValue(initial = -Infinity): (v: number) => number {
  const maxRef = useRef(initial)

  const applyMax = (value: number) => {
    if (value > maxRef.current) {
      maxRef.current = value
    }
    return maxRef.current
  }

  return applyMax
}

export function useClientRect<T extends HTMLElement>() {
  const [rect, setRect] = useState<DOMRect | null>(null)

  const ref = useCallback((node: T | null) => {
    if (node !== null) {
      setRect(node.getBoundingClientRect())
    }
  }, [])

  useLayoutEffect(() => {
    const handleResize = () => {
      if (ref.current) {
        setRect(ref.current.getBoundingClientRect())
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return [rect, ref] as const
}

const PADDING = 15
const Y_OFFSET = -20

export function HoverTooltip({
  position,
  children,
  dataSections,
  style = {},
}: HoverTooltipProps) {
  const ref = useRef<HTMLElement>(null)

  const applyMaxW = useMaxValue(0)
  const applyMaxY = useMaxValue(0)

  const prevRef = usePrevious(ref.current)

  const positioning = useMemo(() => {
    if (!ref.current) {
      return {
        opacity: 0,
      }
    }

    const rect = ref.current.getBoundingClientRect()
    const parentRect = ref.current.offsetParent?.getBoundingClientRect()

    if (!parentRect) {
      console.warn('could not find parentRect for HoverTooltip')
      return {
        opacity: 0,
      }
    }

    const maxW = applyMaxW(rect?.width || 0)
    const maxH = applyMaxY(rect?.height || 0)

    const translateX =
      position[0] + maxW + PADDING * 2 < parentRect.width
        ? 'translateX(0)'
        : `translateX(calc(-100% - ${2 * PADDING}px))`

    const translateY =
      position[1] + maxH + PADDING * 2 + Y_OFFSET < parentRect.height
        ? 'translateY(0)'
        : `translateY(calc(-100% + ${PADDING}px + ${-1 * Y_OFFSET}px)`

    return {
      left: position[0] + PADDING,
      top: position[1] + Y_OFFSET,
      transform: `${translateX} ${translateY}`,

      //
      // If previous ref was not set, it means
      // that this is the first time the component
      // is being rendered, thus do not animate
      //
      transition: !prevRef ? 'none' : 'transform .3s ease',
    }
  }, [position])

  return (
    <Container
      ref={ref}
      style={{
        // left: position[0],
        // top: position[1],
        ...positioning,
        minWidth: 200,
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
