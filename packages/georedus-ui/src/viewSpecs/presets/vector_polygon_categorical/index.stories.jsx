import { GeoReDUS } from '../../../GeoReDUS'

import { versionedSearchParamsStateHook } from '@orioro/react-versioned-state'
import { useSearchParams, BrowserRouter } from 'react-router-dom'

export default {
  title: 'Presets / vector_polygon_categorical',
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
        id: 'mma_malha_unidades_conservacao_2026.geom',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'vector_polygon_categorical',
        tiles:
          '${VECTOR_TILE_SERVER_ENDPOINT}/mma_malha_unidades_conservacao_2026.geom/{z}/{x}/{y}',
        source_layer: 'mma_malha_unidades_conservacao_2026.geom',
        path: 'Polygon Categorical Test / _',
        label: 'Unidades de Conservação',
        style: {
          categoryKey: 'categoria',
          colorScheme: 'schemeSet3',
          categories:
            '${METADATA_API_ENDPOINT}/mma_malha_unidades_conservacao_2026?select=value:categoria',
          opacity: 0.2,
        },
        tooltip: {
          title: 'nome_uc',
          entries: ['categoria'],
        },
        sourceLabel: 'MMA',
        shortDescription: 'Vector Polygon Categorical Preset',
        metodology: `Vector Polygon Categorical Preset: **style** em formato *json*.

  - **categoryKey**: nome da coluna a ser categorizada;
  - **colorScheme**: string com nome da paleta de cores;
  - **categories**: endpoint de metadados;
  - **opacity**: opacidade da camada;
\`\`\`json
{
  "categoryKey": "categoria",
  "colorScheme": "schemeSet3",
  "categories": "\${METADATA_API_ENDPOINT}/mma_malha_unidades_conservacao_2026?select=value:categoria",
  "opacity": 0.2
}
\`\`\`
`,
        download_url:
          '${VECTOR_TILE_SERVER_ENDPOINT}/mma_malha_unidades_conservacao_2026.geom/{z}/{x}/{y}',
      },
      {
        id: 'sgb_malha_risco_2026.geom',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'vector_polygon_categorical',
        tiles:
          '${VECTOR_TILE_SERVER_ENDPOINT}/sgb_malha_risco_2026.geom/{z}/{x}/{y}',
        source_layer: 'sgb_malha_risco_2026.geom',
        path: 'Test Dir / _',
        label: 'Cartografia de Risco',
        style: {
          categoryKey: 'grau_de_risco',
          categories: [
            {
              value: 'Muito alto',
              label: 'Risco Muito Alto',
              color: 'schemeGeoReDUS.vermelho',
            },
            {
              value: 'Alto',
              label: 'Risco Alto',
              color: 'schemeGeoReDUS.laranja',
            },
          ],
        },
        tooltip: {
          title: 'nome_uc',
          entries: ['categoria'],
        },
        sourceLabel: 'Test',
        metodology: 'test metodology',
        download_url:
          '${VECTOR_TILE_SERVER_ENDPOINT}/sgb_malha_risco_2026.geom/{z}/{x}/{y}',
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
