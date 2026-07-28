import { GeoReDUS } from '../../../GeoReDUS'

import { versionedSearchParamsStateHook } from '@orioro/react-versioned-state'
import { useSearchParams, BrowserRouter } from 'react-router-dom'

export default {
  title: 'Presets / vector_point_categorical',
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
        id: 'test_item_1',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'vector_point_categorical',
        path: 'Test dir / _',
        label: 'Estabelecimentos de Cultura',
        tiles:
          '${VECTOR_TILE_SERVER_ENDPOINT}/mun_maceio_malha_pontos_culturais_2026.geom/{z}/{x}/{y}',
        source_layer: 'mun_maceio_malha_pontos_culturais_2026.geom',
        style: {
          categoryKey: 'tipo',
          categories: [
            { value: 'Pontos Culturais', color: 'schemeGeoReDUS.azul' },
            { value: 'Atrativos Turísticos', color: 'schemeGeoReDUS.rosa' },
          ],
          //adicionar em metodology do storybook e readme doc
          opacity: 0.5,
          border: false,
          radius: 15,
        },
        tooltip: '',
        sourceLabel: 'TEst',
        metodology: 'test metodology',
      },
      {
        id: 'test_item_2',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'vector_point_categorical',
        path: 'Test dir / _',
        label: 'Conselho Tutelar',
        tiles:
          '${VECTOR_TILE_SERVER_ENDPOINT}/mun_maceio_malha_conselho_tutelar_2025.geom/{z}/{x}/{y}',
        source_layer: 'mun_maceio_malha_conselho_tutelar_2025.geom',
        style: {
          categoryKey: 'nome',
          categories:
            '${METADATA_API_ENDPOINT}/mun_maceio_malha_conselho_tutelar_2025?select=value:nome',
        },
        tooltip: '',
        sourceLabel: 'TEst',
        metodology: 'test metodology',
      },
    ],
  ],
}

export const Basic = () => {
  const [stateStorage, setStateStorage] = useVersionedSearchParamsState(
    {
      // Maceió (IGBE id)
      municipioId: 2704302,
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
