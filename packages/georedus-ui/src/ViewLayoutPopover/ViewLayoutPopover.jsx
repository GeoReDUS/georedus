import React from 'react'

import { Icon } from '@mdi/react'
import { mdiClose, mdiLayers } from '@mdi/js'
import { IconButton, Popover, Text } from '@radix-ui/themes'

import { ViewLayoutControl } from './ViewLayoutControl'
import { useMemo } from 'react'
import { Flex, Button } from '@orioro/react-ui-core'

export function ViewLayoutPopover({
  viewSpecs,
  viewConfState,
  viewConfDispatch,

  ...props
}) {
  const activeViewCount = useMemo(
    () => Object.keys(viewConfState.byId).length,
    [viewConfState.byId],
  )

  return (
    <Popover.Root>
      <Popover.Trigger>
        <Button
          variant={activeViewCount > 0 ? 'solid' : 'soft'}
          size="1"
          {...props}
        >
          <Icon path={mdiLayers} size="16px" /> Camadas ativas{' '}
          {activeViewCount ? `(${activeViewCount})` : null}
        </Button>
      </Popover.Trigger>

      <Popover.Content
        size="1"
        align="center"
        style={{
          background: 'var(--accent-3)',
          overflow: 'hidden',
          position: 'relative',
        }}
        maxWidth="none"
      >
        <Flex direction="row" gap="3">
          {activeViewCount > 0 ? (
            <ViewLayoutControl
              viewSpecs={viewSpecs}
              viewConfState={viewConfState}
              viewConfDispatch={viewConfDispatch}
            />
          ) : (
            <Text size="1">Nenhuma camada ativa</Text>
          )}
          <Popover.Close>
            <IconButton size="1" variant="ghost">
              <Icon path={mdiClose} size="16px" />
            </IconButton>
          </Popover.Close>
        </Flex>
      </Popover.Content>
    </Popover.Root>
  )
}
