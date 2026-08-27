import { GeoReDUS } from '../../../GeoReDUS'

import { versionedSearchParamsStateHook } from '@orioro/react-versioned-state'
import { useSearchParams, BrowserRouter } from 'react-router-dom'

export default {
  title: 'Presets / gtfs_lines',
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
        id: 'cem_gtfs_linhas_avg_frequency',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'gtfs_lines',
        tiles:
          '${VECTOR_TILE_SERVER_ENDPOINT}/cem_gtfs_linhas.geom/{z}/{x}/{y}',
        source_layer: 'cem_gtfs_linhas.geom',
        path: 'GTFS Lines Test / _ / Frequencia ',
        label: 'Linhas Todas - Frequencia',
        style: {
          lineWidth: {
            valueKey: 'avg_frequency',
            values:
              '${METADATA_API_ENDPOINT}/cem_gtfs_linhas?select=value:avg_frequency&cd_mun=eq.${municipioId}',
          },
          opacity: 0.1
        },
        sourceLabel: 'Test',
        shortDescription: 'GTFS Lines Preset',
      },
      {
        id: 'cem_gtfs_linhas_balsa_avg_frequency',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'gtfs_lines',
        tiles:
          '${VECTOR_TILE_SERVER_ENDPOINT}/cem_gtfs_linhas_balsa.geom/{z}/{x}/{y}',
        source_layer: 'cem_gtfs_linhas_balsa.geom',
        path: 'GTFS Lines Test / _ / Frequencia',
        label: 'Linhas - Balsa',
        style: {
          lineWidth: {
            valueKey: 'avg_frequency',
            values:
              '${METADATA_API_ENDPOINT}/cem_gtfs_linhas_balsa?select=value:avg_frequency&cd_mun=eq.${municipioId}',
          },
          opacity: 0.1
        },
        sourceLabel: 'Test',
        shortDescription: 'GTFS Lines Preset',
      },
      {
        id: 'cem_gtfs_linhas_bonde_vlt_avg_frequency',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'gtfs_lines',
        tiles:
          '${VECTOR_TILE_SERVER_ENDPOINT}/cem_gtfs_linhas_bonde_vlt.geom/{z}/{x}/{y}',
        source_layer: 'cem_gtfs_linhas_bonde_vlt.geom',
        path: 'GTFS Lines Test / _ / Frequencia',
        label: 'Linhas - Bolde/VLT',
        style: {
          lineWidth: {
            valueKey: 'avg_frequency',
            values:
              '${METADATA_API_ENDPOINT}/cem_gtfs_linhas_bonde_vlt?select=value:avg_frequency&cd_mun=eq.${municipioId}',
          },
          opacity: 0.1
        },
        sourceLabel: 'Test',
        shortDescription: 'GTFS Lines Preset',
      },
      {
        id: 'cem_gtfs_linhas_brt_avg_frequency',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'gtfs_lines',
        tiles:
          '${VECTOR_TILE_SERVER_ENDPOINT}/cem_gtfs_linhas_brt.geom/{z}/{x}/{y}',
        source_layer: 'cem_gtfs_linhas_brt.geom',
        path: 'GTFS Lines Test / _ / Frequencia',
        label: 'Linhas - BRT',
        style: {
          lineWidth: {
            valueKey: 'avg_frequency',
            values:
              '${METADATA_API_ENDPOINT}/cem_gtfs_linhas_brt?select=value:avg_frequency&cd_mun=eq.${municipioId}',
          },
          opacity: 0.1
        },
        sourceLabel: 'Test',
        shortDescription: 'GTFS Lines Preset',
      },
      {
        id: 'cem_gtfs_linhas_metro_avg_frequency',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'gtfs_lines',
        tiles:
          '${VECTOR_TILE_SERVER_ENDPOINT}/cem_gtfs_linhas_metro.geom/{z}/{x}/{y}',
        source_layer: 'cem_gtfs_linhas_metro.geom',
        path: 'GTFS Lines Test / _ / Frequencia',
        label: 'Linhas - Metro',
        style: {
          lineWidth: {
            valueKey: 'avg_frequency',
            viewKey: 'cem_gtfs_linhas_metro',
            cd_mun: '${municipioId}',
            values:
              '${METADATA_API_ENDPOINT}/cem_gtfs_linhas_metro?select=value:avg_frequency&cd_mun=eq.${municipioId}',
          },
          opacity: 1
        },
        sourceLabel: 'Test',
        shortDescription: 'GTFS Lines Preset',
      },
      {
        id: 'cem_gtfs_linhas_onibus_avg_frequency',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'gtfs_lines',
        tiles:
          '${VECTOR_TILE_SERVER_ENDPOINT}/cem_gtfs_linhas_onibus.geom/{z}/{x}/{y}',
        source_layer: 'cem_gtfs_linhas_onibus.geom',
        path: 'GTFS Lines Test / _ / Frequencia',
        label: 'Linhas - Ônibus',
        style: {
          lineWidth: {
            valueKey: 'avg_frequency',
            viewKey: 'cem_gtfs_linhas_onibus',
            cd_mun: '${municipioId}',
            values:
              '${METADATA_API_ENDPOINT}/cem_gtfs_linhas_onibus?select=value:avg_frequency&cd_mun=eq.${municipioId}',
          },
          opacity: 0.1
        },
        sourceLabel: 'Test',
        shortDescription: 'GTFS Lines Preset',
      },
      {
        id: 'cem_gtfs_linhas_trem_avg_frequency',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'gtfs_lines',
        tiles:
          '${VECTOR_TILE_SERVER_ENDPOINT}/cem_gtfs_linhas_trem.geom/{z}/{x}/{y}',
        source_layer: 'cem_gtfs_linhas_trem.geom',
        path: 'GTFS Lines Test / _ / Frequencia',
        label: 'Linhas - Trem',
        style: {
          lineWidth: {
            valueKey: 'avg_frequency',
            viewKey: 'cem_gtfs_linhas_trem',
            cd_mun: '${municipioId}',
            values:
              '${METADATA_API_ENDPOINT}/cem_gtfs_linhas_trem?select=value:avg_frequency&cd_mun=eq.${municipioId}',
          },
          opacity: 1
        },
        sourceLabel: 'Test',
        shortDescription: 'GTFS Lines Preset',
      },
      {
        id: 'cem_gtfs_linhas_headway_min',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'gtfs_lines',
        tiles:
          '${VECTOR_TILE_SERVER_ENDPOINT}/cem_gtfs_linhas.geom/{z}/{x}/{y}',
        source_layer: 'cem_gtfs_linhas.geom',
        path: 'GTFS Lines Test / _ / Headway',
        label: 'Linhas Todas - Headway',
        style: {
          lineWidth: {
            valueKey: 'headway_minimo',
            values:
              '${METADATA_API_ENDPOINT}/cem_gtfs_linhas?select=value:headway_minimo&cd_mun=eq.${municipioId}',
          },
          opacity: 0.1
        },
        sourceLabel: 'Test',
        shortDescription: 'GTFS Lines Preset',
      },
      {
        id: 'cem_gtfs_linhas_balsa_headway_min',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'gtfs_lines',
        tiles:
          '${VECTOR_TILE_SERVER_ENDPOINT}/cem_gtfs_linhas_balsa.geom/{z}/{x}/{y}',
        source_layer: 'cem_gtfs_linhas_balsa.geom',
        path: 'GTFS Lines Test / _ / Headway',
        label: 'Linhas - Balsa',
        style: {
          lineWidth: {
            valueKey: 'headway_minimo',
            values:
              '${METADATA_API_ENDPOINT}/cem_gtfs_linhas_balsa?select=value:headway_minimo&cd_mun=eq.${municipioId}',
          },
          opacity: 0.1
        },
        sourceLabel: 'Test',
        shortDescription: 'GTFS Lines Preset',
      },
      {
        id: 'cem_gtfs_linhas_bonde_vlt_headway_min',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'gtfs_lines',
        tiles:
          '${VECTOR_TILE_SERVER_ENDPOINT}/cem_gtfs_linhas_bonde_vlt.geom/{z}/{x}/{y}',
        source_layer: 'cem_gtfs_linhas_bonde_vlt.geom',
        path: 'GTFS Lines Test / _ / Headway',
        label: 'Linhas - Bolde/VLT',
        style: {
          lineWidth: {
            valueKey: 'headway_minimo',
            values:
              '${METADATA_API_ENDPOINT}/cem_gtfs_linhas_bonde_vlt?select=value:headway_minimo&cd_mun=eq.${municipioId}',
          },
          opacity: 0.1
        },
        sourceLabel: 'Test',
        shortDescription: 'GTFS Lines Preset',
      },
      {
        id: 'cem_gtfs_linhas_brt_headway_min',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'gtfs_lines',
        tiles:
          '${VECTOR_TILE_SERVER_ENDPOINT}/cem_gtfs_linhas_brt.geom/{z}/{x}/{y}',
        source_layer: 'cem_gtfs_linhas_brt.geom',
        path: 'GTFS Lines Test / _ / Headway',
        label: 'Linhas - BRT',
        style: {
          lineWidth: {
            valueKey: 'headway_minimo',
            values:
              '${METADATA_API_ENDPOINT}/cem_gtfs_linhas_brt?select=value:headway_minimo&cd_mun=eq.${municipioId}',
          },
          opacity: 0.1
        },
        sourceLabel: 'Test',
        shortDescription: 'GTFS Lines Preset',
      },
      {
        id: 'cem_gtfs_linhas_metro_headway_min',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'gtfs_lines',
        tiles:
          '${VECTOR_TILE_SERVER_ENDPOINT}/cem_gtfs_linhas_metro.geom/{z}/{x}/{y}',
        source_layer: 'cem_gtfs_linhas_metro.geom',
        path: 'GTFS Lines Test / _ / Headway',
        label: 'Linhas - Metro',
        style: {
          lineWidth: {
            valueKey: 'headway_minimo',
            values:
              '${METADATA_API_ENDPOINT}/cem_gtfs_linhas_metro?select=value:headway_minimo&cd_mun=eq.${municipioId}',
          },
          opacity: 1
        },
        sourceLabel: 'Test',
        shortDescription: 'GTFS Lines Preset',
      },
      {
        id: 'cem_gtfs_linhas_onibus_headway_min',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'gtfs_lines',
        tiles:
          '${VECTOR_TILE_SERVER_ENDPOINT}/cem_gtfs_linhas_onibus.geom/{z}/{x}/{y}',
        source_layer: 'cem_gtfs_linhas_onibus.geom',
        path: 'GTFS Lines Test / _ / Headway',
        label: 'Linhas - Ônibus',
        style: {
          lineWidth: {
            valueKey: 'headway_minimo',
            values:
              '${METADATA_API_ENDPOINT}/cem_gtfs_linhas_onibus?select=value:headway_minimo&cd_mun=eq.${municipioId}',
          },
          opacity: 0.1
        },
        sourceLabel: 'Test',
        shortDescription: 'GTFS Lines Preset',
      },
      {
        id: 'cem_gtfs_linhas_trem_headway_min',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'gtfs_lines',
        tiles:
          '${VECTOR_TILE_SERVER_ENDPOINT}/cem_gtfs_linhas_trem.geom/{z}/{x}/{y}',
        source_layer: 'cem_gtfs_linhas_trem.geom',
        path: 'GTFS Lines Test / _ / Headway',
        label: 'Linhas - Trem',
        style: {
          lineWidth: {
            valueKey: 'headway_minimo',
            values:
              '${METADATA_API_ENDPOINT}/cem_gtfs_linhas_trem?select=value:headway_minimo&cd_mun=eq.${municipioId}',
          },
          opacity: 1
        },
        sourceLabel: 'Test',
        shortDescription: 'GTFS Lines Preset',
      },
    ],
  ],
}

// cem_gtfs_linhas
// cem_gtfs_linhas_balsa
// cem_gtfs_linhas_bonde_vlt
// cem_gtfs_linhas_brt
// cem_gtfs_linhas_metro
// cem_gtfs_linhas_onibus
// cem_gtfs_linhas_trem

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
