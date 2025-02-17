import { Box, Input } from '@orioro/react-ui-core'
import { Tabs, Text, Theme, Tooltip } from '@radix-ui/themes'
import { Icon } from '@mdi/react'
import { mdiFilterVariant, mdiPalette } from '@mdi/js'
import { useMemo, useState } from 'react'
import { isPlainObject, pick } from 'lodash'

import { useDebounce } from 'react-use'

const CONF_TABS = {
  data: {
    id: 'data',
    icon: <Icon path={mdiFilterVariant} size="16px" />,
    label: 'Dados',
  },
  style: {
    id: 'style',
    icon: <Icon path={mdiPalette} size="16px" />,
    label: 'Visualização',
  },
}

const CONF_TAB_ORDER = ['data', 'style']

export function ViewConfTabs({ viewSpec, viewConf, onUpdateViewConf }) {
  //
  // Debounce updating view conf. Prevent's fast changing controls
  // from accidentally triggering map view re-renders unnecessarily
  //
  const [immediateViewConf, setImmediateViewConf] = useState(viewConf)
  useDebounce(() => onUpdateViewConf(immediateViewConf), 500, [
    immediateViewConf,
  ])

  const enabledTabs = useMemo(
    () =>
      CONF_TAB_ORDER.map((tabId) =>
        viewSpec.conf &&
        isPlainObject(viewSpec.conf[tabId]) &&
        Object.values(viewSpec.conf[tabId]).some(Boolean)
          ? CONF_TABS[tabId]
          : null,
      ).filter(Boolean),
    [viewSpec],
  )

  return enabledTabs.length > 0 ? (
    <Tabs.Root defaultValue={enabledTabs[0].id}>
      <Tabs.List size="1">
        {enabledTabs.map((tab) => (
          <Tabs.Trigger key={tab.id} value={tab.id}>
            <Tooltip content={tab.label}>{tab.icon}</Tooltip>
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {enabledTabs.map((tab) => {
        const tabConfSchema = viewSpec.conf[tab.id]
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
      })}
    </Tabs.Root>
  ) : (
    <Box
      p="3"
      style={{
        fontSize: '.9rem',
      }}
    >
      Visualização habilitada
    </Box>
  )
}
