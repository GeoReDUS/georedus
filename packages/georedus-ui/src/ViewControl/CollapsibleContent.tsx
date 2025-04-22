import React from 'react'

import * as Collapsible from '@radix-ui/react-collapsible'
import styled, { keyframes } from 'styled-components'

const CollapsibleContent_slideDown = keyframes`
  from {
    height: 0;
  }
  to {
    height: var(--radix-collapsible-content-height);
  }
`

const CollapsibleContent_slideUp = keyframes`
  from {
    height: var(--radix-collapsible-content-height);
  }
  to {
    height: 0;
  }
`

export const CollapsibleContent = styled(Collapsible.Content)`
  overflow: hidden;
  &[data-state='open'] {
    animation: ${CollapsibleContent_slideDown} 100ms ease-out;
  }
  &[data-state='closed'] {
    animation: ${CollapsibleContent_slideUp} 100ms ease-out;
  }
`
