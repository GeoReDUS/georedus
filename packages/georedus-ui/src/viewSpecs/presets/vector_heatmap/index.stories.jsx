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
              metodology: `Vector Heatmap Preset: **style** em formato *json*. 

  - **colorScheme** (string com nome da paleta de cores);
  - **minzoom**/**maxzoom** (níveis de zoom em que o heatmap em gradiente é exibido);
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
              path: 'Heatmap Test / _',
              label: 'Hortifrutti With Circle',
              style: {
                colorScheme: 'schemeGreens',
                circle: true,
              },
              tooltip: '',
              sourceLabel: 'MMA',
              shortDescription: 'Vector Heatmap Preset',
              metodology: `Vector Heatmap Preset: **style** em formato *json*. 
              
  - **colorScheme** (string com nome da paleta de cores);
  - **circle** (boolean; quando **true**, o heatmap é renderizado como círculos proporcionais ao invés de um gradiente contínuo);
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
            {
              id: 'overture_places_poc',
              collection_id: 'test',
              indicator_id: 'test',
              preset: 'vector_heatmap',
              tiles:
                '${VECTOR_TILE_SERVER_ENDPOINT}/overture_br_places.geom/{z}/{x}/{y}?v=1',
              source_layer: 'overture_br_places.geom',
              path: 'Heatmap Test / _',
              label: 'Pontos de atividade comercial',
              style: {
                circle: true,
                weight: 1,
                radius: [9, 1, 17, 15],
                circle_radius: [17, 5, 20, 10],
              },
              tooltip: '',
              sourceLabel: 'Test',
              shortDescription: 'Vector Heatmap Preset',
              metodology: `Vector Heatmap Preset: **style** em formato *json*. 

  - **circle** (boolean; quando **true**, o heatmap é renderizado também como círculos proporcionais);
  - **weight** (peso de cada ponto no cálculo do heatmap);
  - **radius** (array de interpolação por zoom, no formato *[zoom1, raio1, zoom2, raio2, ...]*, definindo o raio do heatmap em gradiente);
  - **circle_radius** (array de interpolação por zoom no mesmo formato, definindo o raio dos círculos quando **circle** é **true**);
  - **colorScheme** não está definido, portanto será renderizado com uma paleta padrão;
\`\`\`json
{
  "circle": true,
  "weight": 1,
  "radius": [9, 1, 17, 15],
  "circle_radius": [17, 5, 20, 10]
}
\`\`\`
`,
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
