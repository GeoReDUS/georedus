import { Button } from '@/components/Button'
import Icon from '@mdi/react'
import { mdiLayers } from '@mdi/js'
import { Popover, Text } from '@radix-ui/themes'

import { ViewLayoutControl } from './ViewLayoutControl'
import { useMemo } from 'react'

export function ViewLayoutPopover({
  viewSpecs,
  viewConfState,
  viewConfDispatch,
}) {
  const activeViewCount = useMemo(
    () => Object.keys(viewConfState.byId).length,
    [viewConfState.byId],
  )

  return (
    <>
      <Popover.Root>
        <Popover.Trigger>
          <Button variant={activeViewCount > 0 ? 'solid' : 'soft'} size="1">
            <Icon path={mdiLayers} size="16px" /> Camadas ativas{' '}
            {activeViewCount ? `(${activeViewCount})` : null}
          </Button>
        </Popover.Trigger>

        <Popover.Content
          size="1"
          align="center"
          style={{
            padding: 12,
            background: 'var(--accent-3)',
            overflow: 'hidden',
            // width:
          }}
          maxWidth="1000px"
          minHeight="200px"
        >
          {activeViewCount > 0 ? (
            <ViewLayoutControl
              viewSpecs={viewSpecs}
              viewConfState={viewConfState}
              viewConfDispatch={viewConfDispatch}
            />
          ) : (
            <Text size="1">Nenhuma camada ativa</Text>
          )}
        </Popover.Content>
      </Popover.Root>
    </>
  )
}
