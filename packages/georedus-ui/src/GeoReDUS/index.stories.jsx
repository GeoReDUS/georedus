import { GeoReDUS } from './GeoReDUS'

import { versionedSearchParamsStateHook } from '@orioro/react-versioned-state'
import { useSearchParams, BrowserRouter } from 'react-router-dom'

import { overture_places_poc } from '../viewSpecs/development/overture_places_poc'
import { br_divisao_territorial_views } from '../viewSpecs/development/br_divisao_territorial'
import { ana_br_bacias_hidrograficas } from '../viewSpecs/development/ana_br_bacias_hidrograficas'

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

const API = {
  METADATA_API_ENDPOINT: process.env.STORYBOOK_GEO_METADATA_API_ENDPOINT,
  VECTOR_TILE_SERVER_ENDPOINT:
    process.env.STORYBOOK_GEO_VECTOR_TILE_SERVER_ENDPOINT,
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
      overture_places_poc(API),
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
