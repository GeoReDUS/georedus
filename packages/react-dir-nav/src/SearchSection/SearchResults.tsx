import React, { useMemo } from 'react'
import { Button, Flex } from '@orioro/react-ui-core'
import { optionsIndexer } from '@orioro/react-select'
import { Item as DefaultItem } from '../Item'
import styled from 'styled-components'
import { Icon } from '@mdi/react'
import { mdiClose } from '@mdi/js'
import { MakeDirNavProps } from '../types'

const index = optionsIndexer({
  getOptionSearchCorpus: (option) => {
    return [option.label, option.value, option.keywords]
      .flat(1)
      .filter(Boolean)
      .join(' ')
  },
})

const DefaultItemContainer = styled.div``

const UsageInstructions = styled.div`
  padding: calc(1.5 * var(--dir-nav-base-padding));
  text-align: center;
  font-size: 0.9rem;
`

const ResultsContainer = styled.div`
  height: 100%;
  overflow: auto;
  flex-grow: 1;
  flex-shrink: 1;
  background-color: var(--dir-nav-background-color);
`

export function makeSearchResults(config?: MakeDirNavProps) {
  const { ItemContainer = DefaultItemContainer, Item = DefaultItem } =
    config?.components || {}
  return function SearchResults({
    tree,
    textSearch,
    onClear,
  }: {
    tree: any
    textSearch: string
    onClear: () => void
  }) {
    const search = useMemo(
      () =>
        index(
          tree
            .nodeArray()
            .filter((node) => node.type === 'item')
            .map((node) => ({
              value: node.id,
              label: node.label,
              keywords: node.keywords,
            })),
        ),
      [tree],
    )

    const searchResults = useMemo(() => {
      const nodesById = tree.nodesById()
      return search(textSearch).map((option) => nodesById[option.value])
    }, [search, textSearch])

    return (
      <ResultsContainer>
        {searchResults.length > 0 ? (
          <ItemContainer>
            {search(textSearch).map((option, idx: number) => (
              <Item
                key={idx}
                node={tree.node(option.value)}
                depth={0}
                textSearch={textSearch}
              />
            ))}
          </ItemContainer>
        ) : (
          <UsageInstructions>
            <Flex direction="column" gap="10px" alignItems="center">
              <div>Não há resultados correspondentes à sua busca</div>
              <Button
                size="1"
                variant="ghost"
                type="button"
                onClick={onClear}
              >
                Limpar busca <Icon path={mdiClose} size="16px" />
              </Button>
            </Flex>
          </UsageInstructions>
        )}
      </ResultsContainer>
    )
  }
}
