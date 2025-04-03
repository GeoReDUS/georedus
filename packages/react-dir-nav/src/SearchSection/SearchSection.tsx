import React, { useMemo, useRef, useState } from 'react'
import { Button, Flex, TextInput } from '@orioro/react-ui-core'
import { optionsIndexer } from '@orioro/react-select'
import { Item as DefaultItem } from '../Item'
import styled from 'styled-components'
import { NavSection } from '../NavSection'
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
    const [textSearch, setTextSearch] = useState('')

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
      <NavSection
        header={
          <TextInput
            ref={queryInputRef}
            value={textSearch}
            onSetValue={setTextSearch}
            validate={false}
            placeholder="Pesquisar indicadores"
          />
        }
      >
        {textSearch &&
          (searchResults.length > 0 ? (
            <ItemContainer>
              {search(textSearch).map((option, index) => (
                <Item
                  key={index}
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
                  onClick={() => {
                    queryInputRef.current?.focus()
                    setTextSearch('')
                  }}
                >
                  Limpar busca <Icon path={mdiClose} size="16px" />
                </Button>
              </Flex>
            </UsageInstructions>
          ))}

        {!textSearch && (
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
