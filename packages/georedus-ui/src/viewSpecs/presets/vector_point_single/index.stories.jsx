import { GeoReDUS } from '../../../GeoReDUS'

import { versionedSearchParamsStateHook } from '@orioro/react-versioned-state'
import { useSearchParams, BrowserRouter } from 'react-router-dom'

export default {
  title: 'Presets / vector_point_single',
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
        id: 'mun_maceio_malha_saude_2026.geom',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'vector_point_single',
        tiles:
          '${VECTOR_TILE_SERVER_ENDPOINT}/mun_maceio_malha_saude_2026.geom/{z}/{x}/{y}',
        source_layer: 'mun_maceio_malha_saude_2026.geom',
        path: 'Test Dir / _ ',
        label: 'Equipamentos de saúde',
        style: 'schemeGeoReDUS.verde',
        tooltip: {
          title: 'name',
          entries: ['classes'],
        },
        sourceLabel: 'Test',
        shortDescription: 'Vector Point Single Preset',
        metodology:
          'Vector Point Single Preset: parâmetro **style** preenchido somente com string contendo valor da cor (**schemeGeoReDUS.verde**) ',
        download_url:
          '${VECTOR_TILE_SERVER_ENDPOINT}/mun_maceio_malha_saude_2026.geom/{z}/{x}/{y}',
      },
      {
        id: 'mun_maceio_malha_areas_de_emprego_2025.geom',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'vector_point_single',
        tiles:
          '${VECTOR_TILE_SERVER_ENDPOINT}/mun_maceio_malha_areas_de_emprego_2025.geom/{z}/{x}/{y}',
        source_layer: 'mun_maceio_malha_areas_de_emprego_2025.geom',
        path: 'Test Dir / _ ',
        label: 'Áreas de Emprego',
        style: {
          color: 'schemeGeoReDUS.vermelho_claro',
          radius: 15,
          opacity: 0.5,
          border: false,
        },
        tooltip: {
          title: 'nome_uc',
          entries: ['categoria'],
        },
        sourceLabel: 'Test',
        shortDescription: 'Vector Point Single Preset',
        metodology: `Vector Point Single Preset: **style** em formato *json* com todos os parâmetros. **color** (string com nome/valor da cor), **radius** (raio em pixels), **opacity** (opacidade de 0 a 1) e **border** (boolean) :
\`\`\`json
{
  "color": "schemeGeoReDUS.vermelho_claro",
  "radius": 15,
  "opacity": 0.5,
  "border": false,
}
\`\`\`
`,
        download_url:
          '${VECTOR_TILE_SERVER_ENDPOINT}/mun_maceio_malha_areas_de_emprego_2025.geom/{z}/{x}/{y}',
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
