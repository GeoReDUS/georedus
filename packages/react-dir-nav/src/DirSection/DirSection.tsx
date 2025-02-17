import React, { useState } from 'react'
import { Heading, Select } from '@radix-ui/themes'
import { Flex } from '@orioro/react-ui-core'
import { makeDirTree } from '../DirTree/DirTree'
import styled from 'styled-components'
import { NavSection } from '../NavSection'
import { MakeDirNavProps } from '../types'

const SingleChildBadge = styled.div`
  font-size: var(--font-size-1);
  background-color: var(--color-surface);
  color: var(--gray-12);
  padding-left: var(--space-2);
  padding-right: var(--space-2);
  height: var(--space-5);

  display: flex;
  align-items: center;
  border-radius: 4px;
  border: 1px solid var(--gray-5);
`

export function makeDirSection(config?: MakeDirNavProps) {
  const DirTree = makeDirTree(config)

  return function DirSection({ node, tree }) {
    const childNodes = tree.childIds(node.id).map((id) => tree.node(id))
    const [tabId, setTabId] = useState(childNodes[0]?.id || null)

    return (
      <NavSection
        header={
          <Flex
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap="30px"
          >
            <Heading
              as="h2"
              size="3"
              style={{
                maxWidth: '60%',
              }}
            >
              {node.label}
            </Heading>
            {childNodes.length === 1 ? (
              <SingleChildBadge>{childNodes[0].label}</SingleChildBadge>
            ) : (
              <Select.Root size="1" value={tabId} onValueChange={setTabId}>
                <Select.Trigger />
                <Select.Content>
                  {childNodes.map((childNode) => (
                    <Select.Item
                      key={`${node.id}_${childNode.id}`}
                      value={childNode.id}
                    >
                      {childNode.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            )}
          </Flex>
        }
      >
        <DirTree tree={tree} rootNodeId={tabId} />
      </NavSection>
    )
  }
}
