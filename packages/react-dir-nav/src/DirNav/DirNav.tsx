import React from 'react'
import { Flex } from '@orioro/react-ui-core'
import {
  Node,
  nodesFromPaths,
  nodeIdFromPath,
  treeModel,
} from '@orioro/tree-model'
import { useMemo } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import styled from 'styled-components'
import { DirSection, makeDirSection } from '../DirSection'
import { SearchSection } from '../SearchSection'
import { Icon } from '@mdi/react'
import { mdiFolderOutline, mdiMagnify } from '@mdi/js'
import { Tooltip } from '@radix-ui/themes'
import { DirNavContext } from './DirNavContext'
import { MakeDirNavProps } from '../types'

export type DirItem = Node & {
  path: string
}

export type DirNavProps = {
  items: DirItem[]
  onSelectItem?: (item: DirItem) => any
  getNodeIcon?: (node: DirItem) => React.ReactNode
  style?: React.CSSProperties
  sideBarBottom?: React.ReactNode
}

const IconTabTrigger = styled(Tabs.Trigger)`
  padding: 0;
  border: none;

  width: var(--dir-nav-tab-button-size);
  height: var(--dir-nav-tab-button-size);

  background-color: var(--dir-nav-surface-color);

  transition:
    color 0.3s ease,
    background-color 0.3s ease;

  border-bottom: solid 1px var(--gray-7);

  &:hover,
  &:focus {
    background-color: var(--accent-5);
  }

  &[data-state='active'] {
    background-color: var(--accent-9);
    color: white;
    cursor: default;
  }

  > div {
    cursor: pointer;

    width: var(--dir-nav-tab-button-size);
    height: var(--dir-nav-tab-button-size);
    display: flex;
    align-items: center;
    justify-content: center;
    > svg {
      height: calc(0.6 * var(--dir-nav-tab-button-size));
      width: calc(0.6 * var(--dir-nav-tab-button-size));
    }
  }
`

function defaultGetNodeIcon(node: DirItem): React.ReactNode {
  return <Icon path={mdiFolderOutline} size="30px" />
}

export function makeDirNav(config: MakeDirNavProps = {}) {

  const DirSection = makeDirSection(config)

  return function DirNav({
    items,
    getNodeIcon = defaultGetNodeIcon,
    sideBarBottom = null,

    style = {},
    onSelectItem,

    ...flexProps
  }: DirNavProps) {
    const tree = useMemo(() => {
      const paths = items
        .map((item) => item.path)
        .filter((path) => typeof path === 'string' && path !== '')

      const dirNodes = nodesFromPaths(paths)

      return treeModel()([
        ...dirNodes.map((node) => ({ ...node, type: 'dir' })),
        ...items.map((item) => ({
          ...item,
          parentId: item.path ? nodeIdFromPath(item.path) : null,
          type: 'item',
        })),
      ])
    }, [items])

    return (
      <DirNavContext.Provider
        value={{
          onSelectItem,
        }}
      >
        <Tabs.Root
          orientation="vertical"
          style={{
            ...style,
            '--dir-nav-tab-button-size': '60px',
            '--dir-nav-surface-color': 'var(--accent-2)',
            '--dir-nav-background-color': 'var(--accent-4)',
            '--dir-nav-separator-color': 'var(--accent-5)',
            '--dir-nav-base-padding': '10px',
          }}
          defaultValue="_search"
        >
          <Flex direction="row" gap="0" height="100%" width="100%">
            <Flex direction="column" justifyContent="space-between" gap="0">
              <Tabs.List asChild>
                <Flex
                  direction="column"
                  gap="0"
                  style={{
                    flexGrow: 0,
                    flexShrink: 0,
                    borderRight: '1px solid var(--gray-5)',
                    backgroundColor: 'var(--dir-nav-surface-color)',
                  }}
                >
                  <IconTabTrigger value="_search">
                    <Tooltip side="right" content="Busca">
                      <div>
                        <Icon path={mdiMagnify} />
                      </div>
                    </Tooltip>
                  </IconTabTrigger>
                  {tree.rootNodeIds().map((id: string) => (
                    <IconTabTrigger key={id} value={id}>
                      <Tooltip side="right" content={tree.node(id).label}>
                        <div>
                          {getNodeIcon(tree.node(id)) || tree.node(id).label}
                        </div>
                      </Tooltip>
                    </IconTabTrigger>
                  ))}
                </Flex>
              </Tabs.List>
              {sideBarBottom}
            </Flex>

            <div
              style={{
                height: '100%',
                flexGrow: 1,
                flexShrink: 1,
              }}
            >
              <Tabs.Content
                value="_search"
                style={{
                  height: '100%',
                  width: '100%',
                }}
              >
                <SearchSection tree={tree} />
              </Tabs.Content>
              {tree.rootNodeIds().map((id: string) => (
                <Tabs.Content
                  key={id}
                  value={id}
                  style={{
                    height: '100%',
                    width: '100%',
                  }}
                >
                  <DirSection node={tree.node(id)} tree={tree} />
                </Tabs.Content>
              ))}
            </div>
          </Flex>
        </Tabs.Root>
      </DirNavContext.Provider>
    )
  }
}

export const DirNav = makeDirNav()
