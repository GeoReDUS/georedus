import React, { useState } from 'react'
import { DirNav } from './DirNav'
import ITEMS from './DivNav.stories.data.json'
import { Debug, Flex, UIProvider } from '@orioro/react-ui-core'
import styled from 'styled-components'
import { Icon } from '@mdi/react'
import { mdiAccountGroup, mdiSchool, mdiShare, mdiTrainCar } from '@mdi/js'
import { IconButton } from '@radix-ui/themes'

export default {
  title: 'DirNav',

  parameters: {
    layout: 'fullscreen',
  },
}

const ItemContainer = styled.div`
  padding: 10px;
  background-color: var(--accent-3);
`

const STATIC_NODE_ICONS = {
  'populacao-e-domicilios': <Icon path={mdiAccountGroup} />,
  educacao: <Icon path={mdiSchool} />,
  infraestrutura: <Icon path={mdiTrainCar} />,
}

export const Basic = () => {
  const [selected, setSelected] = useState(null)

  return (
    <Flex direction="row">
      <UIProvider
        components={{
          ItemContainer,
        }}
      >
        <Flex direction="column" height="100vh" width="350px">
          <Flex
            p="10px"
            style={{
              backgroundColor: 'var(--accent-3)',
            }}
          >
            External App header
          </Flex>

          <DirNav
            style={{
              flexGrow: 1,
              overflow: 'hidden',
            }}
            items={ITEMS}
            onSelectItem={(item) => {
              setSelected(item)
            }}
            getNodeIcon={(node) => STATIC_NODE_ICONS[node.id]}
            sideBarBottom={
              <Flex
                direction="column"
                alignItems="center"
                pt="10px"
                pb="10px"
                style={{
                  background: 'var(--green-3)',
                }}
              >
                <IconButton radius="none" variant="outline">
                  <Icon path={mdiShare} size="20px" />
                </IconButton>
              </Flex>
            }
          />

          <Flex
            p="10px"
            style={{
              backgroundColor: 'var(--accent-3)',
            }}
          >
            External App footer
          </Flex>
        </Flex>
      </UIProvider>
      <Flex
        direction="row"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        style={{
          flexGrow: 1,
          overflow: 'auto',
          fontSize: '.8rem',
        }}
      >
        <Debug
          data={{
            selected,
          }}
        />
      </Flex>
    </Flex>
  )
}
