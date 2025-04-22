import {
  Debug,
  Flex,
  entriesByIdInitialState,
  entriesByIdReducer,
} from '@orioro/react-ui-core'
import { ViewMenu } from './ViewMenu'
import {
  viewConfReducer,
  viewConfReducerInitialState,
} from '../GeoReDUS/viewConfReducer'
import { useReducer, useState } from 'react'
import { IconButton } from '@radix-ui/themes'
import { mdiUpload } from '@mdi/js'
import { Icon } from '@mdi/react'
import { useDialogs } from '../DialogSystem'
import { useQuery } from '@tanstack/react-query'
import { fetchViewSpecs, resolveViewSpecs } from '../viewSpecs'
// import { importViewsFromCsv } from '../importViewsFromCsv'

export default {
  title: 'GeoReDUS / ViewMenu',
  parameters: {
    layout: 'fullscreen',
  },
}

const CEM_CENSO_2010 =
  'https://docs.google.com/spreadsheets/d/e/' +
  '2PACX-1vQ7R3I_EjXhXkNK5OE4qUG_uiSg9qZrPIzzVPtj0fNA4EympIWzQA4KkFt6TNwp6RYH7ZgaJrDJ4z6J' +
  '/pub?gid=' +
  '2016686120' +
  '&single=true&output=csv'

const CEM_CENSO_2022 =
  'https://docs.google.com/spreadsheets/d/e/' +
  '2PACX-1vQ7R3I_EjXhXkNK5OE4qUG_uiSg9qZrPIzzVPtj0fNA4EympIWzQA4KkFt6TNwp6RYH7ZgaJrDJ4z6J' +
  '/pub?gid=' +
  '1523585495' +
  '&single=true&output=csv'

const CEM_ESCOLAS_2022 =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7R3I_EjXhXkNK5OE4qUG_uiSg9qZrPIzzVPtj0fNA4EympIWzQA4KkFt6TNwp6RYH7ZgaJrDJ4z6J/pub?gid=1942442229&single=true&output=csv'

const GOOGLE_SHEETS_VIEW_SPECS = [
  CEM_CENSO_2010,
  CEM_CENSO_2022,
  CEM_ESCOLAS_2022,
]

export const Basic = () => {
  const dialogs = useDialogs()

  const [viewConfState, viewConfDispatch] = useReducer(
    viewConfReducer,
    null,
    viewConfReducerInitialState,
  )

  const viewSpecsQuery = useQuery({
    queryKey: ['ViewSpecs', GOOGLE_SHEETS_VIEW_SPECS],
    queryFn: async () =>
      resolveViewSpecs(await fetchViewSpecs(GOOGLE_SHEETS_VIEW_SPECS), {
        METADATA_API_ENDPOINT: 'metadata_api',
        VECTOR_TILE_SERVER_ENDPOINT: 'vector_tile_server',
      }),
    throwOnError: true,
  })

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

        {viewSpecsQuery.status === 'success' && (
          <ViewMenu
            viewSpecs={viewSpecsQuery.data}
            viewConfState={viewConfState}
            onSetView={(viewConf, layoutIndex) => {
              viewConfDispatch({
                type: 'SET_VIEW',
                payload: {
                  viewConf,
                  layoutIndex,
                },
              })
            }}
            onDeactivateView={(viewId) => {
              viewConfDispatch({
                type: 'DEACTIVATE_VIEW',
                payload: viewId,
              })
            }}
            sideBarBottom={
              <Flex direction="column" alignItems="center" p="3">
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
        )}
      </Flex>
      <Debug data={viewConfState} />
    </Flex>
  )
}
