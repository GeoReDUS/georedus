import { GeoReDUS } from '../../../GeoReDUS'

import { versionedSearchParamsStateHook } from '@orioro/react-versioned-state'
import { useSearchParams, BrowserRouter } from 'react-router-dom'

export default {
  title: 'Presets / gtfs_stops',
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
        id: 'cem_gtfs_estacoes_departures_per_hour',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'gtfs_stops',
        path: 'GTFS Stops Test / _',
        label: 'Estações - Partidas por hora',
        tiles:
          '${VECTOR_TILE_SERVER_ENDPOINT}/cem_gtfs_estacoes.geom/{z}/{x}/{y}',
        source_layer: 'cem_gtfs_estacoes.geom',
        style: {
          color: 'schemeGeoReDUS.verde_agua',
          filter: true,
          radius: {
            valueKey: 'partidas',
            cd_mun: '${municipioId}',
            // values:
            //   '${METADATA_API_ENDPOINT}/cem_gtfs_estacoes?select=value:departures_per_hour&cd_mun=eq.${municipioId}',
          },
        },
        tooltip: '',
        sourceLabel: 'TEst',
        shortDescription: 'GTFS Stops Preset',
        metodology: `GTFS Stops metodologia`,
      },
      {
        id: 'cem_gtfs_estacoes_n_linhas',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'gtfs_stops',
        path: 'GTFS Stops Test / _',
        label: 'Estações - Num de linhas',
        tiles:
          '${VECTOR_TILE_SERVER_ENDPOINT}/cem_gtfs_estacoes.geom/{z}/{x}/{y}',
        source_layer: 'cem_gtfs_estacoes.geom',
        style: {
          color: 'schemeGeoReDUS.verde_agua',
          filter: true,
          radius: {
            valueKey: 'linhas',
            cd_mun: '${municipioId}',
            // values:
            //   '${METADATA_API_ENDPOINT}/cem_gtfs_estacoes?select=value:n_linhas&cd_mun=eq.${municipioId}',
          },
        },
        tooltip: '',
        sourceLabel: 'TEst',
        shortDescription: 'GTFS Stops Preset',
        metodology: `GTFS Stops metodologia`,
      },
    ],
  ],
}

export const Basic = () => {
  const [stateStorage, setStateStorage] = useVersionedSearchParamsState(
    {
      // São Paulo (IGBE id)
      municipioId: 3550308,
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
    />
  )
}
