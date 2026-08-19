import React from 'react'
import { TextInput } from '@orioro/react-ui-core'
import styled from 'styled-components'
import { MakeDirNavProps } from '../types'

const SearchBarContainer = styled.div`
  background-color: var(--dir-nav-background-color);
  padding: calc(1.5 * var(--dir-nav-base-padding));
  border-bottom: 1px solid var(--dir-nav-separator-color);
  flex-shrink: 0;
  flex-grow: 0;
`
export function makeSearchBar(_config?: MakeDirNavProps) {
  return function SearchBar({
    value,
    onSetValue,
    inputRef,
  }: {
    value: string
    onSetValue: (value: string) => void
    inputRef: React.RefObject<any>
  }) {
    return (
      <SearchBarContainer>
        <TextInput
          ref={inputRef}
          value={value}
          onSetValue={onSetValue}
          validate={false}
          placeholder="Pesquisar indicadores"
        />
      </SearchBarContainer>
    )
  }
}
