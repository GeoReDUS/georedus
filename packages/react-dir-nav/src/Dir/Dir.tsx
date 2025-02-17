import React, { useState } from 'react'
import styled from 'styled-components'
import * as Collapsible from '@radix-ui/react-collapsible'
import { CollapsibleContent } from './CollapsibleContent'

import { Icon } from '@mdi/react'
import { mdiChevronRight, mdiFolder, mdiFolderOpen } from '@mdi/js'
import { CollapsibleTrigger } from './CollapsibleTrigger'
import { TextEllipsis, useComponents } from '@orioro/react-ui-core'
import { useSortedNodesByType } from './useSortedNodesByType'
import { MakeDirNavProps } from '../types'

const Container = styled.div`
  &:not(:last-child) {
    border-bottom: 1px solid var(--dir-nav-separator-color);
  }
`
const EmptyNodeList = styled.div`
  padding: var(--dir-nav-base-padding);
`

const DefaultDirContainer = styled.div``

const DefaultItemContainer = styled.div``

export function makeDir(config?: MakeDirNavProps) {
  const {
    DirContainer = DefaultDirContainer,
    ItemContainer = DefaultItemContainer,
  } = config?.components || {}

  return function Dir({ node, depth, NodeList }) {
    const [open, setOpen] = useState(false)

    const _byType = useSortedNodesByType(node.childNodes)

    return (
      <Container>
        <Collapsible.Root open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger>
            <div
              style={{
                paddingLeft: depth * 10,
              }}
            >
              <Icon
                style={{
                  transform: open ? 'rotateZ(90deg)' : 'rotateZ(0)',
                }}
                path={mdiChevronRight}
                size="20px"
              />
              <Icon path={open ? mdiFolderOpen : mdiFolder} size="20px" />
            </div>
            <TextEllipsis
              style={{
                textAlign: 'left',
              }}
            >
              {node.label}
            </TextEllipsis>
          </CollapsibleTrigger>

          <CollapsibleContent>
            {_byType.dir?.length > 0 ? (
              <DirContainer>
                <NodeList nodes={_byType.dir} depth={depth + 1} />
              </DirContainer>
            ) : null}

            {_byType.item?.length > 0 ? (
              <ItemContainer>
                <NodeList nodes={_byType.item} depth={depth + 1} />
              </ItemContainer>
            ) : null}

            {Object.keys(_byType).length === 0 ? (
              <EmptyNodeList>Não há conteúdo</EmptyNodeList>
            ) : null}
          </CollapsibleContent>
        </Collapsible.Root>
      </Container>
    )
  }
}
