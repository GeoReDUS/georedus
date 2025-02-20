import React, { useMemo, useRef, useState } from 'react'
import {
  Button,
  Flex,
  Input,
  TextInput,
  useComponents,
} from '@orioro/react-ui-core'
import { optionsIndexer } from '@orioro/react-select'
import { Item as DefaultItem } from '../Item'
import styled from 'styled-components'
import { NavSection } from '../NavSection'
import { Icon } from '@mdi/react'
import { mdiClose } from '@mdi/js'
import { MakeDirNavProps } from '../types'

const index = optionsIndexer({
  // getOptionSearchCorpus: (option)
})

const DefaultItemContainer = styled.div``

const UsageInstructions = styled.div`
  padding: calc(1.5 * var(--dir-nav-base-padding));
  text-align: center;
  font-size: 0.9rem;
`

export function makeSearchSection(config?: MakeDirNavProps) {
  const { ItemContainer = DefaultItemContainer, Item = DefaultItem } =
    config?.components || {}
  return function SearchSection({ tree }) {
    const [query, setQuery] = useState('')

    const queryInputRef = useRef(null)

    const search = useMemo(
      () =>
        index(
          tree
            .nodeArray()
            .filter((node) => node.type === 'item')
            .map((node) => ({
              value: node.id,
              label: node.label,
            })),
        ),
      [tree],
    )

    const searchResults = useMemo(() => {
      const nodesById = tree.nodesById()

      return search(query).map((option) => nodesById[option.value])
    }, [search, query])

    return (
      <NavSection
        header={
          <TextInput
            ref={queryInputRef}
            value={query}
            onSetValue={setQuery}
            validate={false}
            placeholder="Pesquisar indicadores"
          />
        }
      >
        {query &&
          (searchResults.length > 0 ? (
            <ItemContainer>
              {search(query).map((option, index) => (
                <Item key={index} node={tree.node(option.value)} depth={0} />
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
                  onClick={() => {
                    queryInputRef.current?.focus()
                    setQuery('')
                  }}
                >
                  Limpar busca <Icon path={mdiClose} size="16px" />
                </Button>
              </Flex>
            </UsageInstructions>
          ))}

        {!query && (
          <UsageInstructions>
            Pesquise por indicadores digitando termos de interesse, ou navegue
            pelos temas nas abas à esquerda.
          </UsageInstructions>
        )}
      </NavSection>
    )

    // return (
    //   <Flex direction="column">

    //   </Flex>
    // )
  }
}
