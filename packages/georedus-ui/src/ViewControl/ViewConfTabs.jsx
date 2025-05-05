import React from 'react'

import { Box, Flex, DropdownMenu, Input } from '@orioro/react-ui-core'
import { Markdown } from '../Markdown'
import { Heading, IconButton, Tabs, Theme, Tooltip } from '@radix-ui/themes'
import { Icon } from '@mdi/react'
import {
  mdiDotsVertical,
  mdiDownload,
  mdiFilterVariant,
  mdiHelpCircleOutline,
  mdiOpacity,
} from '@mdi/js'
import { useMemo, useState } from 'react'
import { isPlainObject } from 'lodash'

import { useDebounce } from 'react-use'
import { useDialogs } from '../DialogSystem'

const CONF_TABS = {
  data: {
    id: 'data',
    icon: <Icon path={mdiFilterVariant} size="16px" />,
    label: 'Dados',
  },
  style: {
    id: 'style',
    icon: <Icon path={mdiOpacity} size="16px" />,
    label: 'Visualização',
  },
}

const CONF_TAB_ORDER = ['data', 'style']

export function ViewConfTabs({ viewSpec, viewConf, resolvedView, onSetView }) {
  const CONF_SCHEMA = viewSpec.confSchema

  //
  // Debounce updating view conf. Prevent's fast changing controls
  // from accidentally triggering map view re-renders unnecessarily
  //
  const [immediateViewConf, setImmediateViewConf] = useState(viewConf)
  useDebounce(() => onSetView(immediateViewConf), 500, [immediateViewConf])

  const enabledTabs = useMemo(
    () =>
      CONF_TAB_ORDER.map((tabId) =>
        CONF_SCHEMA &&
        isPlainObject(CONF_SCHEMA[tabId]) &&
        Object.values(CONF_SCHEMA[tabId]).some(Boolean)
          ? CONF_TABS[tabId]
          : null,
      ).filter(Boolean),
    [CONF_SCHEMA],
  )

  const dialogs = useDialogs()

  return (
    <Tabs.Root defaultValue={enabledTabs[0]?.id || null}>
      <Flex direction="row" gap="0">
        <Tabs.List size="1">
          {enabledTabs.map((tab) => (
            <Tabs.Trigger key={tab.id} value={tab.id}>
              <Tooltip content={tab.label}>{tab.icon}</Tooltip>
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Flex
          direction="row"
          alignItems="center"
          gap="10px"
          pr="10px"
          pl="10px"
          height="var(--space-6)"
          style={{
            flexGrow: 1,
            boxShadow:
              'color(display-p3 0.0039 0.251 0.5137 / 0.174) 0px -1px 0px 0px inset',
          }}
        >
          {viewSpec.metodology && (
            <IconButton
              variant="ghost"
              size="1"
              onClick={async () => {
                const markdown = await dialogs.loading(async () => {
                  if (typeof viewSpec.metodology === 'function') {
                    return viewSpec.metodology(viewSpec)
                  } else if (typeof viewSpec.metodology === 'string') {
                    return viewSpec.metodology.startsWith('https://')
                      ? fetch(viewSpec.metodology).then((res) => res.text())
                      : viewSpec.metodology
                  } else {
                    return null
                  }
                })

                if (typeof markdown === 'string') {
                  await dialogs.view({
                    maxHeight: '90vh',
                    children: (
                      <>
                        <Heading as="h1">
                          {viewSpec.label} - Notas metodológicas
                        </Heading>
                        <Markdown children={markdown.trim()} />
                      </>
                    ),
                  })
                }
              }}
            >
              <Tooltip content="Notas metodológicas">
                <Icon path={mdiHelpCircleOutline} size="16px" />
              </Tooltip>
            </IconButton>
          )}

          {typeof resolvedView?.download === 'function' && (
            <IconButton
              variant="ghost"
              size="1"
              onClick={() =>
                resolvedView.download({
                  dialogs,
                })
              }
            >
              <Tooltip content="Baixar dados">
                <Icon path={mdiDownload} size="16px" />
              </Tooltip>
            </IconButton>
          )}
          <DropdownMenu
            options={[
              {
                label: 'Visualizar como mapa comparado',
                onClick: () => onSetView(viewConf, 1),
              },
            ]}
          >
            <IconButton variant="ghost" size="1">
              <Icon path={mdiDotsVertical} size="16px" />
            </IconButton>
          </DropdownMenu>
        </Flex>
      </Flex>
      {Array.isArray(enabledTabs) && enabledTabs.length > 0 ? (
        enabledTabs.map((tab) => {
          const tabConfSchema = Object.fromEntries(
            //
            // Omit null confs
            //
            Object.entries(CONF_SCHEMA[tab.id]).filter(([key, value]) =>
              Boolean(value),
            ),
          )
          const tabConfValue = immediateViewConf[tab.id]

          return (
            <Tabs.Content key={tab.id} value={tab.id}>
              <Box p="3">
                <Theme scaling="100%">
                  <Input
                    schema={{
                      type: 'object',
                      properties: tabConfSchema,
                    }}
                    value={tabConfValue}
                    onSetValue={(nextValue) =>
                      setImmediateViewConf({
                        ...viewConf,
                        [tab.id]: {
                          ...(viewConf[tab.id] || {}),
                          ...nextValue,
                        },
                      })
                    }
                  />
                </Theme>
              </Box>
            </Tabs.Content>
          )
        })
      ) : (
        <Box
          p="3"
          style={{
            fontSize: '.9rem',
          }}
        >
          Visualização habilitada
        </Box>
      )}
    </Tabs.Root>
  )
}
