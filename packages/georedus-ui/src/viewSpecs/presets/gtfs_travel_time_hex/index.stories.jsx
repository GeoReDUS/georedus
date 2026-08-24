import { GeoReDUS } from '../../../GeoReDUS'

import { versionedSearchParamsStateHook } from '@orioro/react-versioned-state'
import { useSearchParams, BrowserRouter } from 'react-router-dom'

export default {
  title: 'Presets / gtfs_travel_time_hex',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
}

const API = {
  METADATA_API_ENDPOINT: (
    process.env.STORYBOOK_METADATA_API_ENDPOINT || ''
  ).replace(/\/$/, ''),
  VECTOR_TILE_SERVER_ENDPOINT: (
    process.env.STORYBOOK_VECTOR_TILE_SERVER_ENDPOINT || ''
  ).replace(/\/$/, ''),
  RASTER_TILE_SERVER_ENDPOINT: (
    process.env.STORYBOOK_RASTER_TILE_SERVER_ENDPOINT || ''
  ).replace(/\/$/, ''),
}

const VERSION_SPECS = [
  {
    id: 'v0',
    fromPrev: (prev) => ({ baseMapStyle: 'dataviz', ...(prev || {}) }),
    fromNext: (next) => next || {},
  },
]

const useVersionedSearchParamsState = versionedSearchParamsStateHook(
  VERSION_SPECS,
  useSearchParams,
)

const VIEW_SPECS = {
  all: [
    [
      {
        id: 'cem_malha_hex_res9.geom',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'gtfs_travel_time_hex',
        source_layer: 'cem_malha_hex_res9.geom',
        path: 'GTFS / _',
        label: 'gtfs_travel_time_hex',
        sourceLabel: 'CEM / Cittamobi',
        shortDescription: 'GTFS',
      },
    ],
  ],
}

export const Basic = () => {
  const [stateStorage, setStateStorage] = useVersionedSearchParamsState(
    {
      // São Paulo (IBGE id)
      municipioId: '3550308',
    },
    {
      schema: {
        baseMapStyle: 'string',
        municipioId: 'string',
        regional: 'boolean',
        viewConf: 'object',
        env: 'string',
      },
    },
  )

  return (
    <GeoReDUS
      state={stateStorage}
      onSetState={setStateStorage}
      viewSpecs={VIEW_SPECS}
      api={API}
      // leftPanel={{
      //   categoryIcons: CATEGORY_ICONS,
      // }}
    />
  )
}
