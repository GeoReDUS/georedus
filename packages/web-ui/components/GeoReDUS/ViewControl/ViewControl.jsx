import { Box, Flex, SwitchInput, TextEllipsis } from '@orioro/react-ui-core'
import { Heading, Text } from '@radix-ui/themes'
import styled from 'styled-components'
import * as Collapsible from '@radix-ui/react-collapsible'
import { CollapsibleContent } from './CollapsibleContent'
import { ViewConfTabs } from './ViewConfTabs'
import { useCallback, useEffect } from 'react'

const Container = styled(Box)`
  --view-control-base-padding: 12px;
  box-shadow:
    rgba(0, 0, 0, 0.12) 0px 1px 3px,
    rgba(0, 0, 0, 0.24) 0px 1px 2px;

  border-radius: 2px;
  background-color: var(--redus-bege, white);
`

const Summary = styled.div`
  background-color: var(--redus-bege, white);
  padding: 0;

  display: flex;
  border: none;
  text-align: left;
  width: 100%;

  cursor: pointer;

  &:hover {
    background-color: color-mix(in srgb, var(--redus-bege) 80%, white);
  }

  &:active {
    filter: brightness(96%);
  }
`

function resolveDefaultConf(viewSpec) {
  return Object.fromEntries(
    Object.entries(viewSpec.conf || {}).map(([confScopeId, confSet]) => [
      confScopeId,
      Object.fromEntries(
        Object.entries(confSet).map(([confKey, confSettings]) => [
          confKey,
          confSettings?.defaultValue,
        ]),
      ),
    ]),
  )
}

export function ViewControl({
  viewSpec,
  viewConf,
  onActivateView,
  onDeactivateView,
  onUpdateViewConf,
}) {
  useEffect(() => {
    console.log(`Component mounted: ViewControl`)
    return () => console.log(`Component unmounted: ViewControl`)
  }, [])

  const active = Boolean(viewConf)

  const deactivateView = useCallback(
    () => onDeactivateView(),
    [onDeactivateView],
  )

  const activateView = useCallback(
    () => onActivateView(resolveDefaultConf(viewSpec)),
    [viewSpec, onActivateView],
  )

  const toggleView = useCallback(
    () => (active ? deactivateView() : activateView()),
    [active, deactivateView, activateView],
  )

  return (
    <Collapsible.Root open={active}>
      <Container>
        <Summary type="button">
          <Flex
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            p="3"
            width="100%"
          >
            <Flex
              direction="column"
              gap="0"
              onClick={() => toggleView()}
              style={{
                flexGrow: '1',
              }}
            >
              <Heading
                size="2"
                as="h4"
                style={{
                  fontWeight: 'normal',
                  color: 'var(--accent-12)',
                }}
              >
                <TextEllipsis maxLines={2}>{viewSpec.label}</TextEllipsis>
              </Heading>
              <Text
                color="gray"
                style={{
                  color: 'var(--gray-9)',
                  textTransform: 'uppercase',
                }}
              >
                {viewSpec.sourceLabel}
              </Text>
            </Flex>

            <SwitchInput
              radius="full"
              value={active}
              onSetValue={() => toggleView()}
            />
          </Flex>
        </Summary>

        <CollapsibleContent
          style={{
            borderTop: '1px solid var(--gray-8)',
          }}
        >
          {viewConf && (
            <ViewConfTabs
              viewSpec={viewSpec}
              viewConf={viewConf}
              onUpdateViewConf={onUpdateViewConf}
            />
          )}
        </CollapsibleContent>
      </Container>
    </Collapsible.Root>
  )
}
