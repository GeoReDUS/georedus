import { GeoReDUS } from '../../../GeoReDUS'

import { versionedSearchParamsStateHook } from '@orioro/react-versioned-state'
import { useSearchParams, BrowserRouter } from 'react-router-dom'

export default {
  title: 'Presets / vector_polygon_continuous',
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
        id: 'mun_maceio_malha_dengue_por_bairro_2023.geom',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'vector_polygon_continuous',
        tiles:
          '${VECTOR_TILE_SERVER_ENDPOINT}/mun_maceio_malha_dengue_por_bairro_2023.geom/{z}/{x}/{y}',
        source_layer: 'mun_maceio_malha_dengue_por_bairro_2023.geom',
        path: 'Polygon Continuous Test / _ ',
        label: 'Dengue 2023',
        style: {
          valueKey: 'dengue_2023',
          values:
            '${METADATA_API_ENDPOINT}/mun_maceio_malha_dengue_por_bairro_2023?select=value:dengue_2023',
        },
        tooltip: {
          entries: {
            dengue_2023: 'Casos de dengue',
          },
        },
        sourceLabel: 'Test',
        shortDescription: 'Vector Polygon Continuous Preset',
        metodology: `Vector Polygon Continuous Preset: **style** em formato *json*.

  - **valueKey**: nome da coluna a ser usada como valor;
  - **values**: endpoint de metadados;
\`\`\`json
{
  "valueKey": "dengue_2023",
  "values": "${'METADATA_API_ENDPOINT'}/mun_maceio_malha_dengue_por_bairro_2023?select=value:dengue_2023"
}
\`\`\`
`,
        download_url:
          '${VECTOR_TILE_SERVER_ENDPOINT}/mun_maceio_malha_dengue_por_bairro_2023.geom/{z}/{x}/{y}',
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
