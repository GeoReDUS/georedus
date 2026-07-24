import { GeoReDUS } from '../../../GeoReDUS'

import { versionedSearchParamsStateHook } from '@orioro/react-versioned-state'
import { useSearchParams, BrowserRouter } from 'react-router-dom'

export default {
  title: 'Presets / vector_heatmap',
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
      viewSpecs={{
        all: [
          [
            {
              id: 'cem_malha_estabelecimentos_cnpj_hortifruti.geom',
              collection_id: 'test',
              indicator_id: 'test',
              preset: 'vector_heatmap',
              tiles:
                '${VECTOR_TILE_SERVER_ENDPOINT}/cem_malha_estabelecimentos_cnpj_hortifruti.geom/{z}/{x}/{y}',
              source_layer: 'cem_malha_estabelecimentos_cnpj_hortifruti.geom',
              path: 'Heatmap Test / _ / CNPJ',
              label: 'Hortifrutti',
              style: {
                colorScheme: 'schemeGreens',
                minzoom: 7,
                maxzoom: 16,
              },
              tooltip: '',
              sourceLabel: 'MMA',
              shortDescription: 'Vector Heatmap Preset',
              metodology: `Vector Heatmap Preset: parâmetro *style* preenchido em formato *json*. Parâmetros: *colorScheme* e *minzoom*/*maxzoom* (controlam em quais níveis de zoom o heatmap em gradiente é exibido):
\`\`\`json
{
  "colorScheme": "schemeGreens",
  "minzoom": 7,
  "maxzoom": 16
}
\`\`\`
`,
              download_url:
                '${VECTOR_TILE_SERVER_ENDPOINT}/cem_malha_estabelecimentos_cnpj_hortifruti.geom/{z}/{x}/{y}',
            },
          ],
        ],
      }}
      api={API}
      // leftPanel={{
      //   categoryIcons: CATEGORY_ICONS,
      // }}
    />
  )
}

export const WithCircle = () => {
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
      viewSpecs={{
        all: [
          [
            {
              id: 'cem_malha_estabelecimentos_cnpj_hortifruti.geom',
              collection_id: 'test',
              indicator_id: 'test',
              preset: 'vector_heatmap',
              tiles:
                '${VECTOR_TILE_SERVER_ENDPOINT}/cem_malha_estabelecimentos_cnpj_hortifruti.geom/{z}/{x}/{y}',
              source_layer: 'cem_malha_estabelecimentos_cnpj_hortifruti.geom',
              path: 'Test / _ / CNPJ',
              label: 'Hortifrutti With Circle',
              style: {
                colorScheme: 'schemeGreens',
                circle: true,
              },
              tooltip: '',
              sourceLabel: 'MMA',
              shortDescription: 'Vector Heatmap Preset',
              metodology: `Vector Heatmap Preset: parâmetro *style* preenchido como um *json* com *colorScheme* e *circle: true*, fazendo com que o heatmap seja renderizado como círculos proporcionais ao invés de um gradiente contínuo:
\`\`\`json
{
  "colorScheme": "schemeGreens",
  "circle": true
}
\`\`\`
`,
              download_url:
                '${VECTOR_TILE_SERVER_ENDPOINT}/cem_malha_estabelecimentos_cnpj_hortifruti.geom/{z}/{x}/{y}',
            },
          ],
        ],
      }}
      api={API}
      // leftPanel={{
      //   categoryIcons: CATEGORY_ICONS,
      // }}
    />
  )
}
