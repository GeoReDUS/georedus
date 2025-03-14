import { Flex } from '@orioro/react-ui-core'
import React from 'react'
import styled from 'styled-components'

const HeaderContainer = styled.div`
  background-color: var(--dir-nav-surface-color);
  padding: var(--dir-nav-base-padding);
  border-bottom: 1px solid var(--dir-nav-separator-color);
  height: var(--dir-nav-section-header-height);
  flex-shrink: 0;
  flex-grow: 0;

  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  box-sizing: border-box;
`

const ContentContainer = styled.div`
  overflow: auto;
  flex-grow: 1;
  flex-shrink: 1;
  background-color: var(--dir-nav-background-color);
`

export function NavSection({
  header,
  children,
}: {
  header: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Flex direction="column" height="100%">
      <HeaderContainer>{header}</HeaderContainer>
      <ContentContainer>{children}</ContentContainer>
    </Flex>
  )
}
