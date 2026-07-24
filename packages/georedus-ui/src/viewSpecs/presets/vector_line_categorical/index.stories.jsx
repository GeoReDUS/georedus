import { GeoReDUS } from '../../../GeoReDUS'

import { versionedSearchParamsStateHook } from '@orioro/react-versioned-state'
import { useSearchParams, BrowserRouter } from 'react-router-dom'

export default {
  title: 'Presets / vector_line_categorical',
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
        id: 'mun_sao_luis_malha_corredores_1992.geom',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'vector_line_categorical',
        tiles:
          '${VECTOR_TILE_SERVER_ENDPOINT}/mun_sao_luis_malha_corredores_1992.geom/{z}/{x}/{y}',
        source_layer: 'mun_sao_luis_malha_corredores_1992.geom',
        path: 'Test Dir / _ ',
        label: 'Zoneamento Corredores',
        style: {
          categoryKey: 'nome',
          lineWidth: 2,
          categories:
            '${METADATA_API_ENDPOINT}/mun_sao_luis_malha_corredores_1992?select=value:nome',
        },
        tooltip: {
          title: 'nome',
          entries: ['corredor'],
        },
        sourceLabel: 'Test',
        shortDescription: 'Vector Line Categorical Preset',
        metodology: `Vector Line Categorical Preset: **style** em formato *json*. **categoryKey** (nome da coluna a ser categorizada), **lineWidth** (espessura da linha) e **categories** (endpoint de metadados); cores atribuídas automaticamente pelo **colorScheme** padrão:
\`\`\`json
{
  "categoryKey": "nome",
  "lineWidth": 2,
  "categories": "\${METADATA_API_ENDPOINT}/mun_sao_luis_malha_corredores_1992?select=value:nome"
}
\`\`\`
`,
        download_url:
          '${VECTOR_TILE_SERVER_ENDPOINT}/mun_sao_luis_malha_corredores_1992.geom/{z}/{x}/{y}',
      },
      {
        id: 'mun_sao_luis_malha_parcelamento_solo_corredores_1992.geom',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'vector_line_categorical',
        tiles:
          '${VECTOR_TILE_SERVER_ENDPOINT}/mun_sao_luis_malha_parcelamento_solo_corredores_1992.geom/{z}/{x}/{y}',
        source_layer:
          'mun_sao_luis_malha_parcelamento_solo_corredores_1992.geom',
        path: 'Test Dir / _ ',
        label: 'Parcelamento Corredores',
        style: {
          categoryKey: 'nome',
          categories: [
            { value: 'CP', color: '#e88974' },
            { value: 'CS1', color: '#318fc6' },
            { value: 'CS2', color: '#d46eb3' },
            { value: 'CS3', color: '#e6d35e' },
            { value: 'CS4', color: '#758756' },
            { value: 'CS5', color: '#50e6be' },
            { value: 'CS6', color: '#9a8feb' },
            { value: 'CS7', color: '#8a374c' },
            { value: 'CS8', color: '#a957fa' },
            { value: 'CS9', color: '#388a87' },
          ],
        },
        tooltip: {
          title: 'nome',
          entries: {
            parcelamen: 'Parcelamento',
          },
        },
        sourceLabel: 'Test',
        shortDescription: 'Vector Line Categorical Preset',
        metodology: `Vector Line Categorical Preset: **style** em formato *json*. **categoryKey** (nome da coluna a ser categorizada) e **categories** (array de objetos com **value** e **color** explícitos para cada categoria), sem **colorScheme**:
\`\`\`json
{
  "categoryKey": "nome",
  "categories": [
    { "value": "CP", "color": "#e88974" },
    { "value": "CS1", "color": "#318fc6" },
    { "value": "CS2", "color": "#d46eb3" },
    { "value": "CS3", "color": "#e6d35e" },
    { "value": "CS4", "color": "#758756" },
    { "value": "CS5", "color": "#50e6be" },
    { "value": "CS6", "color": "#9a8feb" },
    { "value": "CS7", "color": "#8a374c" },
    { "value": "CS8", "color": "#a957fa" },
    { "value": "CS9", "color": "#388a87" }
  ]
}
\`\`\`
`,
        download_url:
          '${VECTOR_TILE_SERVER_ENDPOINT}/mun_sao_luis_malha_parcelamento_solo_corredores_1992.geom/{z}/{x}/{y}',
      },
    ],
  ],
}

export const Basic = () => {
  const [stateStorage, setStateStorage] = useVersionedSearchParamsState(
    {
      //
      // São Luis (IBGE id)
      //
      municipioId: '2111300',
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
