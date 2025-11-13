import { GeoReDUS } from './GeoReDUS'

import { versionedSearchParamsStateHook } from '@orioro/react-versioned-state'
import { useSearchParams, BrowserRouter } from 'react-router-dom'

import {
  overture_places_poc,
  br_divisao_territorial_views,
  ana_br_bacias_hidrograficas,
  hand,
  declividade,
  temperatura_superficie,
  curvatura,
  redus_mutirao_cop_2025,
} from '../viewSpecs'

export default {
  title: 'GeoReDUS / GeoReDUS',
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

const RASTER_TILE_ROOT_PATH = (
  process.env.STORYBOOK_RASTER_TILE_ROOT_PATH ||
  `file:///devtools-data/raster-server`
).replace(/\/$/, '')

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

const GOOGLE_CEM_CENSO_2010 =
  'https://docs.google.com/spreadsheets/d/e/' +
  '2PACX-1vQ7R3I_EjXhXkNK5OE4qUG_uiSg9qZrPIzzVPtj0fNA4EympIWzQA4KkFt6TNwp6RYH7ZgaJrDJ4z6J' +
  '/pub?gid=' +
  '2016686120' +
  '&single=true&output=csv'

const GOOGLE_CEM_CENSO_2022 =
  'https://docs.google.com/spreadsheets/d/e/' +
  '2PACX-1vQ7R3I_EjXhXkNK5OE4qUG_uiSg9qZrPIzzVPtj0fNA4EympIWzQA4KkFt6TNwp6RYH7ZgaJrDJ4z6J' +
  '/pub?gid=' +
  '1523585495' +
  '&single=true&output=csv'

const GOOGLE_CEM_ESCOLAS_2022 =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7R3I_EjXhXkNK5OE4qUG_uiSg9qZrPIzzVPtj0fNA4EympIWzQA4KkFt6TNwp6RYH7ZgaJrDJ4z6J/pub?gid=1942442229&single=true&output=csv'

const GOOGLE_CEM_SAUDE_2024 =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7R3I_EjXhXkNK5OE4qUG_uiSg9qZrPIzzVPtj0fNA4EympIWzQA4KkFt6TNwp6RYH7ZgaJrDJ4z6J/pub?gid=1332018097&single=true&output=csv'

const GOOGLE_SHEETS_VIEW_SPECS = {
  all: [
    GOOGLE_CEM_CENSO_2022,
    GOOGLE_CEM_CENSO_2010,
    GOOGLE_CEM_ESCOLAS_2022,
    GOOGLE_CEM_SAUDE_2024,

    [
      hand({
        ...API,
        mosaicJsonUrl: `${RASTER_TILE_ROOT_PATH}/cem/hand_2018/mosaic.json`,
      }),
      declividade({
        ...API,
        mosaicJsonUrl: `${RASTER_TILE_ROOT_PATH}/cem/declividade_2018/mosaic.json`,
      }),
      temperatura_superficie({
        ...API,
        mosaicJsonUrl: `${RASTER_TILE_ROOT_PATH}/cem/temperatura_superficie_2021_2025/mosaic.json`,
      }),
      curvatura({
        ...API,
        mosaicJsonUrl: `${RASTER_TILE_ROOT_PATH}/cem/curvatura_2018/mosaic.json`,
      }),
      overture_places_poc(API),
      redus_mutirao_cop_2025(API),
      ...br_divisao_territorial_views(API),
      ...ana_br_bacias_hidrograficas(API),
    ],
  ],
  censo_only: [GOOGLE_CEM_CENSO_2022, GOOGLE_CEM_CENSO_2010],
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
      viewSpecs={GOOGLE_SHEETS_VIEW_SPECS}
      api={API}
    />
  )
}
