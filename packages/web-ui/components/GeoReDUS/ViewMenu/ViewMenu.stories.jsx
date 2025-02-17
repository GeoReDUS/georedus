import {
  Debug,
  Flex,
  entriesByIdInitialState,
  entriesByIdReducer,
} from '@orioro/react-ui-core'
import { ViewMenu } from './ViewMenu'
import { useReducer, useState } from 'react'
import { IconButton } from '@radix-ui/themes'
import { mdiUpload } from '@mdi/js'
import Icon from '@mdi/react'
import { useDialogs } from '@/components/DialogSystem'
// import { importViewsFromCsv } from '../importViewsFromCsv'

export default {
  title: 'GeoReDUS / ViewMenu',
  parameters: {
    layout: 'fullscreen',
  },
}


const GOOGLE_SHEETS_VIEW_SPECS =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7R3I_EjXhXkNK5OE4qUG_uiSg9qZrPIzzVPtj0fNA4EympIWzQA4KkFt6TNwp6RYH7ZgaJrDJ4z6J/pub?gid=2016686120&single=true&output=csv'

export const Basic = () => {
  const dialogs = useDialogs()

  const [viewConfState, viewConfDispatch] = useReducer(
    entriesByIdReducer,
    null,
    entriesByIdInitialState,
  )

  return (
    <Flex direction="row" gap="3">
      <Flex direction="column" gap="0" height="100vh" width="350px">
        <Flex
          p="10px"
          style={{
            backgroundColor: 'var(--accent-3)',
          }}
        >
          GeoReDUS
        </Flex>
        <ViewMenu
          viewSpecs={GOOGLE_SHEETS_VIEW_SPECS}
          viewConfById={viewConfState.byId}
          onActivateView={(viewId, initialConf) =>
            viewConfDispatch({
              type: 'ADD_ENTRY',
              payload: {
                ...initialConf,
                id: viewId,
              },
            })
          }
          onDeactivateView={(viewId) => {
            console.log('DELETE_ENTRY', viewId)
            viewConfDispatch({
              type: 'DELETE_ENTRY',
              payload: viewId,
            })
          }}
          onUpdateViewConf={(viewId, nextViewConf) =>
            viewConfDispatch({
              type: 'UPDATE_ENTRY',
              payload: {
                ...nextViewConf,
                id: viewId,
              },
            })
          }
          sideBarBottom={
            <Flex direction="column" alignItems="center" pb="4">
              <IconButton
                radius="none"
                variant="outline"
                // onClick={async () => {
                //   const views = await importViewsFromCsv(dialogs)
                // }}
              >
                <Icon path={mdiUpload} size="16px" />
              </IconButton>
            </Flex>
          }
        />
      </Flex>
      <Debug data={viewConfState} />
    </Flex>
  )
}
