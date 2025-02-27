import { Box, Flex, SwitchInput, TextEllipsis } from '@orioro/react-ui-core'
import { Heading, Text, Tooltip } from '@radix-ui/themes'
import styled from 'styled-components'
import * as Collapsible from '@radix-ui/react-collapsible'
import { CollapsibleContent } from './CollapsibleContent'
import { ViewConfTabs } from './ViewConfTabs'
import { useCallback } from 'react'

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
  onSetView,
  onDeactivateView,
}) {
  const active = Boolean(viewConf)

  const deactivateView = useCallback(
    () => onDeactivateView(),
    [onDeactivateView],
  )

  const setView = useCallback(
    (layoutIndex) => onSetView(resolveDefaultConf(viewSpec), layoutIndex),
    [viewSpec, onSetView],
  )

  const toggleView = useCallback(
    () => (active ? deactivateView() : setView(0)),
    [active, deactivateView, setView],
  )

  return (
    <Collapsible.Root open={active}>
      <Container>
        <Summary type="button" role="button" onClick={() => toggleView()}>
          <Flex
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            p="3"
            width="100%"
          >
            <Flex
              direction="column"
              gap="1"
              style={{
                flexGrow: '1',
              }}
            >
              <Tooltip content={viewSpec.label}>
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
              </Tooltip>
              <Text
                color="gray"
                style={{
                  color: 'var(--gray-9)',
                  textTransform: 'uppercase',
                }}
                size="1"
              >
                {viewSpec.sourceLabel}
              </Text>
            </Flex>

            <SwitchInput
              radius="full"
              value={active}
              onSetValue={() => toggleView()}
              //
              // TODO: implement onclick over
              //
              onClick={(e) => e.stopPropagation()}
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
              onSetView={onSetView}
            />
          )}
        </CollapsibleContent>
      </Container>
    </Collapsible.Root>
  )
}
