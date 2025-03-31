import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import * as Collapsible from '@radix-ui/react-collapsible'
import { CollapsibleContent } from './CollapsibleContent'

import { Icon } from '@mdi/react'
import { mdiChevronRight, mdiFolder, mdiFolderOpen } from '@mdi/js'
import { CollapsibleTrigger } from './CollapsibleTrigger'
import { TextEllipsis, useComponents } from '@orioro/react-ui-core'
import { useSortedNodesByType } from './useSortedNodesByType'
import { MakeDirNavProps } from '../types'
import { Node } from '@orioro/tree-model'
import { groupBy } from 'lodash-es'

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

export function DefaultDirLabel({
  node,
}: {
  node: Node
  depth: number
  open: boolean
}) {
  return (
    <TextEllipsis
      style={{
        textAlign: 'left',
      }}
    >
      {node.label}
    </TextEllipsis>
  )
}

export function makeDir(config?: MakeDirNavProps) {
  const {
    DirLabel = DefaultDirLabel,
    DirContainer = DefaultDirContainer,
    ItemContainer = DefaultItemContainer,
  } = config?.components || {}

  return function Dir({ node, depth, NodeList }) {
    const [open, setOpen] = useState(false)

    //
    // Do not sort nodes, respect their natural order
    // so that sorting is done outside
    //
    // TODO: review API
    //
    const _byType = useMemo(() => {
      return groupBy(node.childNodes, (node) =>
        node.type === 'dir' ? 'dir' : 'item',
      )
    }, [node.childNodes])

    // const _byType = useSortedNodesByType(node.childNodes)

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
            <DirLabel node={node} depth={depth} open={open} />
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
