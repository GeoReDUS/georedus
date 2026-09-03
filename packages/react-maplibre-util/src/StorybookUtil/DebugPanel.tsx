import React from 'react'
import styled from 'styled-components'

type PanelPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

const PANEL_POS: Record<PanelPosition, string> = {
  'top-left': `
    top: 10px;
    left: 10px;
  `,
  'top-right': `
    top: 10px;
    right: 10px;
  `,
  'bottom-left': `
    bottom: 10px;
    left: 10px;
  `,
  'bottom-right': `
    bottom: 10px;
    right: 10px;
  `,
}

export const Panel = styled.div<{
  $position: PanelPosition
}>`
  font-family: sans-serif;
  position: fixed;
  ${({ $position }) => PANEL_POS[$position] || ''}
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  width: 250px;
  overflow: auto;
`

export function DebugPanel({
  data,
  children,
  position = 'bottom-right',
  ...props
}: {
  data: any
  children?: React.ReactNode
  position?: PanelPosition
}) {
  return (
    <Panel {...props} $position={position}>
      {children}
      <code style={{ fontSize: '.65rem', lineHeight: 1.2 }}>
        <pre style={{ margin: 0 }}>{JSON.stringify(data, null, 2)}</pre>
      </code>
    </Panel>
  )
}
