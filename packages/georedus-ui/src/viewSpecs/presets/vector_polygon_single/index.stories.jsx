import { GeoReDUS } from '../../../GeoReDUS'

import { versionedSearchParamsStateHook } from '@orioro/react-versioned-state'
import { useSearchParams, BrowserRouter } from 'react-router-dom'

export default {
  title: 'Presets / vector_polygon_single',
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
        id: 'incra_malha_quilombos_2024.geom',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'vector_polygon_single',
        tiles:
          '${VECTOR_TILE_SERVER_ENDPOINT}/incra_malha_quilombos_2024.geom/{z}/{x}/{y}',
        source_layer: 'incra_malha_quilombos_2024.geom',
        path: 'Test Dir / _ ',
        label: 'Quilombos',
        style: 'schemeGeoReDUS.laranja',
        tooltip: {
          title: 'nome_uc',
          entries: ['categoria'],
        },
        sourceLabel: 'INCRA',
        shortDescription: 'Vector Polygon Single Preset',
        metodology:
          'Vector Polygon Single Preset: **style** em formato *string* contendo valor da cor (**schemeGeoReDUS.laranja**)',
        download_url:
          '${VECTOR_TILE_SERVER_ENDPOINT}/incra_malha_quilombos_2024.geom/{z}/{x}/{y}',
      },
      {
        id: 'sgb_malha_corrida_de_massa_2026.geom',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'vector_polygon_single',
        tiles:
          '${VECTOR_TILE_SERVER_ENDPOINT}/sgb_malha_corrida_de_massa_2026.geom/{z}/{x}/{y}',
        source_layer: 'sgb_malha_corrida_de_massa_2026.geom',
        path: 'Test Dir / _ ',
        label: 'Corrida de Massa',
        style: {
          color: 'schemeGeoReDUS.vermelho_claro',
          fillPattern: 'triangles_1',
          borderStyle: 'dashed',
        },
        tooltip: {
          title: 'nome_uc',
          entries: ['categoria'],
        },
        sourceLabel: 'SGB',
        shortDescription: 'Vector Polygon Single Preset',
        metodology: `Vector Polygon Single Preset: **style** em formato *json* com todos os parâmetros. **color** (string com nome/valor da cor), **fillPattern** (padrão de preenchimento) e **borderStyle** (estilo da borda):
\`\`\`json
{
  "color": "schemeGeoReDUS.vermelho_claro",
  "fillPattern": "triangles_1",
  "borderStyle": "dashed",
}
\`\`\`
`,
        download_url:
          '${VECTOR_TILE_SERVER_ENDPOINT}/sgb_malha_corrida_de_massa_2026.geom/{z}/{x}/{y}',
      },
    ],
  ],
}

export const Basic = () => {
  const [stateStorage, setStateStorage] = useVersionedSearchParamsState(
    {
      // Angra dos Reis (IBGE id)
      municipioId: '3300100',
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
