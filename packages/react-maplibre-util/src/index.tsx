import React from 'react'
import styled from 'styled-components'

export type ComponentProps = {
  children?: React.ReactNode
  bg: string
}

export const Component: React.FC<ComponentProps> = styled.div`
  padding: 10px;

  background-color: ${({ bg }) => bg};
`
