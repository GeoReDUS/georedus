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
        preset: 'vector_point_continuous',
        path: 'Test dir / _',
        label: 'Arboviroses 1',
        tiles:
          '${VECTOR_TILE_SERVER_ENDPOINT}/cem_malha_estabelecimentos_saude_v2.geom/{z}/{x}/{y}',
        source_layer: 'cem_malha_estabelecimentos_saude_v2.geom',
        style: {
          color: 'schemeGeoReDUS.verde_agua',
          filter: true,
          radius: {
            valueKey: 'atendimentos_ambulatoriais_arboviroses',
            values:
              '${METADATA_API_ENDPOINT}/cem_malha_estabelecimentos_saude_v2?select=value:atendimentos_ambulatoriais_arboviroses&id_municipio_gestor_2026=eq.${municipioId}&atendimentos_ambulatoriais_arboviroses=not.is.null',
          },
        },
        tooltip: {
          title: 'str_nome_fantasia',
          entries: ['atendimentos_ambulatoriais_arboviroses', 'id_cnes'],
        },
        sourceLabel: 'TEst',
        metodology: 'test metodology',
      },
      {
        id: 'test_item_2',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'vector_point_continuous',
        path: 'Test dir / _',
        label: 'Arboviroses 2',
        tiles:
          '${VECTOR_TILE_SERVER_ENDPOINT}/cem_malha_estabelecimentos_saude_v2.geom/{z}/{x}/{y}',
        source_layer: 'cem_malha_estabelecimentos_saude_v2.geom',
        style: {
          color: 'schemeGeoReDUS.azul_claro',
          filter: true,
          radius: {
            valueKey: 'atendimentos_ambulatoriais_arboviroses',
            values: [0, 50, 100, 150],
          },
        },
        tooltip: {
          title: 'str_nome_fantasia',
          entries: ['atendimentos_ambulatoriais_arboviroses', 'id_cnes'],
        },
        sourceLabel: 'TEst',
        metodology: 'test metodology',
      },
    ],
  ],
}

export const Basic = () => {
  const [stateStorage, setStateStorage] = useVersionedSearchParamsState(
    {},
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
