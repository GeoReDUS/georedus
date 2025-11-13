import React from 'react'

import { Box, Flex, SwitchInput, TextEllipsis } from '@orioro/react-ui-core'
import { Heading, Text, Tooltip } from '@radix-ui/themes'
import styled from 'styled-components'
import * as Collapsible from '@radix-ui/react-collapsible'
import { CollapsibleContent } from './CollapsibleContent'
import { ViewConfTabs } from './ViewConfTabs'
import { useCallback } from 'react'

import Highlighter from 'react-highlight-words'
import Icon from '@mdi/react'
import { mdiBookOpenVariant } from '@mdi/js'

const Container = styled(Box)`
  --view-control-base-padding: 12px;
  box-shadow:
    rgba(0, 0, 0, 0.12) 0px 1px 3px,
    rgba(0, 0, 0, 0.24) 0px 1px 2px;

  border-radius: 2px;
  background-color: var(--redus-bege, white);
  // background-color: var(--accent-4, white);
`

const Summary = styled.div`
  // background-color: var(--redus-bege, white);
  background-color: ${({ $active }) =>
    $active ? 'var(--redus-bege, white)' : 'var(--accent-2)'};
  padding: 0;

  transition: background-color 0.1s ease-out;

  display: flex;
  border: none;
  text-align: left;
  width: 100%;

  cursor: pointer;

  &:hover {
    // background-color: color-mix(in srgb, var(--redus-bege) 80%, white);
    background-color: ${({ $active }) =>
      $active
        ? 'color-mix(in srgb, var(--redus-bege) 80%, white)'
        : 'var(--redus-bege)'};
  }

  &:active {
    filter: brightness(96%);
  }
`

function _resolveDefaultConf(confSchema) {
  return Object.fromEntries(
    Object.entries(confSchema || {}).map(([confScopeId, confSet]) => [
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

function HeadingWithTooltipAndEllipsis({
  textSearch,
  content,
  maxLines = 2,
  ...props
}) {
  return (
    <Tooltip content={content}>
      <Heading
        size="2"
        as="h4"
        style={{
          fontWeight: 'normal',
          color: 'var(--accent-9)',
        }}
        {...props}
      >
        <TextEllipsis maxLines={maxLines}>
          <Highlighter
            searchWords={
              textSearch && textSearch.length > 3 ? [textSearch] : []
            }
            textToHighlight={content}
          />
        </TextEllipsis>
      </Heading>
    </Tooltip>
  )
}

export function ViewControl({
  textSearch,
  viewSpec,
  viewConf,
  resolvedView,
  onSetView,
  onDeactivateView,

  //
  // By default the view control is configurable
  // This may evolve into custom configurable settings, such
  // as 'explicit_toggle'
  //
  configurable = true,

  path = null,

  style,
}) {
  const active = Boolean(viewConf)

  const deactivateView = useCallback(
    () => onDeactivateView(),
    [onDeactivateView],
  )

  const setView = useCallback(
    (layoutIndex) =>
      onSetView(_resolveDefaultConf(viewSpec.confSchema), layoutIndex),
    [viewSpec, onSetView],
  )

  const toggleView = useCallback(
    () => (active ? deactivateView() : setView()),
    [active, deactivateView, setView],
  )

  return (
    viewSpec && (
      <Collapsible.Root open={configurable === true && active}>
        <Container>
          <Summary
            type="button"
            role="button"
            style={style}
            $active={active}
            onClick={configurable ? () => toggleView() : null}
          >
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
                {path && (
                  <HeadingWithTooltipAndEllipsis
                    size="1"
                    as="h6"
                    content={typeof path === 'string' ? path : viewSpec.path}
                    textSearch={textSearch}
                    maxLines={1}
                    style={{
                      color: 'var(--gray-9)',
                      fontWeight: 'normal',
                    }}
                  />
                )}

                <HeadingWithTooltipAndEllipsis
                  content={viewSpec.label}
                  textSearch={textSearch}
                  maxLines={2}
                />

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

                {viewSpec.shortDescription && (
                  <Flex direction="row" gap="2">
                    <Icon
                      style={{
                        flexShrink: 0,
                        color: 'var(--gray-9)',
                      }}
                      path={mdiBookOpenVariant}
                      size="20px"
                    />
                    <Text
                      color="gray"
                      style={{
                        color: 'var(--gray-9)',
                      }}
                      size="1"
                    >
                      {viewSpec.shortDescription}
                    </Text>
                  </Flex>
                )}
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
                resolvedView={resolvedView}
                onSetView={onSetView}
              />
            )}
          </CollapsibleContent>
        </Container>
      </Collapsible.Root>
    )
  )
}
