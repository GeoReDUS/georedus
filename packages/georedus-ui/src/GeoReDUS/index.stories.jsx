import { GeoReDUS } from './GeoReDUS'

import { versionedSearchParamsStateHook } from '@orioro/react-versioned-state'
import { useSearchParams, BrowserRouter } from 'react-router-dom'

import { Icon } from '@mdi/react'
import {
  mdiAccountGroup,
  mdiSchool,
  mdiHomeCity,
  mdiHospitalBox,
  mdiEarth,
  mdiMap,
} from '@mdi/js'

import {
  overture_places_poc,
  br_divisao_territorial_views,
  ana_br_bacias_hidrograficas,
  hand,
  declividade,
  temperatura_superficie,
  curvatura,
  redus_mutirao_cop_2025,
  piloto_mobilidade_stops,
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

const GOOGLE_MUN_MACEIO =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7R3I_EjXhXkNK5OE4qUG_uiSg9qZrPIzzVPtj0fNA4EympIWzQA4KkFt6TNwp6RYH7ZgaJrDJ4z6J/pub?gid=845075805&single=true&output=csv'

const GOOGLE_MUN_SAO_LUIS =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7R3I_EjXhXkNK5OE4qUG_uiSg9qZrPIzzVPtj0fNA4EympIWzQA4KkFt6TNwp6RYH7ZgaJrDJ4z6J/pub?gid=2087614392&single=true&output=csv'

const GOOGLE_MUN_SAO_CRISTOVAO =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7R3I_EjXhXkNK5OE4qUG_uiSg9qZrPIzzVPtj0fNA4EympIWzQA4KkFt6TNwp6RYH7ZgaJrDJ4z6J/pub?gid=1293057365&single=true&output=csv'

const GOOGLE_MUN_SAO_GONCALO =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7R3I_EjXhXkNK5OE4qUG_uiSg9qZrPIzzVPtj0fNA4EympIWzQA4KkFt6TNwp6RYH7ZgaJrDJ4z6J/pub?gid=543036353&single=true&output=csv'

const GOOGLE_MUN_CURITIBA =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7R3I_EjXhXkNK5OE4qUG_uiSg9qZrPIzzVPtj0fNA4EympIWzQA4KkFt6TNwp6RYH7ZgaJrDJ4z6J/pub?gid=871920015&single=true&output=csv'

const GOOGLE_DIVISOES_TERRITORIAIS =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7R3I_EjXhXkNK5OE4qUG_uiSg9qZrPIzzVPtj0fNA4EympIWzQA4KkFt6TNwp6RYH7ZgaJrDJ4z6J/pub?gid=1006885047&single=true&output=csv'

const GOOGLE_EMERGENCIAS_CLIMATICAS =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7R3I_EjXhXkNK5OE4qUG_uiSg9qZrPIzzVPtj0fNA4EympIWzQA4KkFt6TNwp6RYH7ZgaJrDJ4z6J/pub?gid=874932999&single=true&output=csv'

const GOOGLE_SAUDE_ARBOVIROSES =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7R3I_EjXhXkNK5OE4qUG_uiSg9qZrPIzzVPtj0fNA4EympIWzQA4KkFt6TNwp6RYH7ZgaJrDJ4z6J/pub?gid=2142442976&single=true&output=csv'

const GOOGLE_RASTER =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7R3I_EjXhXkNK5OE4qUG_uiSg9qZrPIzzVPtj0fNA4EympIWzQA4KkFt6TNwp6RYH7ZgaJrDJ4z6J/pub?gid=1869862515&single=true&output=csv'

const ASSETS_BASE = process.env.NODE_ENV === 'development' ? '/' : '/georedus/'

const BUILT_IN_CEM_CENSO_2010 = `${ASSETS_BASE}georedus/data/cem_censo_2010.csv`
const BUILT_IN_CEM_CENSO_2022 = `${ASSETS_BASE}georedus/data/cem_censo_2022.csv`
const BUILT_IN_CEM_ESCOLAS_2022 = `${ASSETS_BASE}georedus/data/cem_escolas_2022.csv`
const BUILT_IN_CEM_SAUDE_2024 = `${ASSETS_BASE}georedus/data/cem_saude_2024.csv`

const GOOGLE_SHEETS_VIEW_SPECS = {
  all: [
    GOOGLE_MUN_MACEIO,
    GOOGLE_MUN_SAO_LUIS,
    GOOGLE_MUN_SAO_CRISTOVAO,
    GOOGLE_MUN_SAO_GONCALO,
    [
      piloto_mobilidade_stops({
        ...API,
        id: 'cittamobi_gtfs_curitiba_2026_stops_with_routes.geom',
        collection_id: 'mun_curitiba_test',
        indicator_id: 'mun_curitiba_test',
        tiles: [
          `${API.VECTOR_TILE_SERVER_ENDPOINT}/cittamobi_gtfs_curitiba_2026_stops_with_routes.geom/{z}/{x}/{y}`,
        ],
        source_layer: 'cittamobi_gtfs_curitiba_2026_stops_with_routes.geom',
        path: 'Curitiba / 2026 / Mobilidade',
        label: 'Pontos de ônibus',
        color: '#1f77b4',
        skip: ['$not', ['$eq', '4106902', ['$get', 'municipioId']]],
      }),
    ],
    GOOGLE_MUN_CURITIBA,
    BUILT_IN_CEM_CENSO_2022,
    BUILT_IN_CEM_CENSO_2010,
    GOOGLE_DIVISOES_TERRITORIAIS,
    GOOGLE_EMERGENCIAS_CLIMATICAS,

    // GOOGLE_CEM_CENSO_2022,
    // GOOGLE_CEM_CENSO_2010,
    GOOGLE_CEM_ESCOLAS_2022,
    GOOGLE_CEM_SAUDE_2024,
    GOOGLE_SAUDE_ARBOVIROSES,
    GOOGLE_RASTER,

    [
      hand({
        ...API,
        // mosaicJsonUrl: `${RASTER_TILE_ROOT_PATH}/cem/hand_2018/mosaic.json`,
        mosaicJsonUrl: `${RASTER_TILE_ROOT_PATH}/ana/hand_2018/mosaic.json`,
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

const CATEGORY_ICONS = {
  'populacao-e-domicilios': <Icon path={mdiAccountGroup} />,
  educacao: <Icon path={mdiSchool} />,
  'infraestrutura-e-servicos-urbanos': <Icon path={mdiHomeCity} />,
  saude: <Icon path={mdiHospitalBox} />,
  'emergencias-climaticas': <Icon path={mdiEarth} />,
  'divisoes-territoriais': <Icon path={mdiMap} />,
  maceio: (
    <img
      src={`${ASSETS_BASE}pilotos/maceio/brasao.png`}
      style={{
        width: 45,
        height: 45,
      }}
    />
  ),
  'sao-luis': (
    <img
      src={`${ASSETS_BASE}pilotos/sao-luis/brasao.png`}
      style={{
        width: 45,
        height: 45,
      }}
    />
  ),
  'sao-cristovao': (
    <img
      src={`${ASSETS_BASE}pilotos/sao-cristovao/brasao.png`}
      style={{
        width: 45,
        height: 45,
      }}
    />
  ),
  'sao-goncalo': (
    <img
      src={`${ASSETS_BASE}pilotos/sao-goncalo/brasao.png`}
      style={{
        width: 45,
        height: 45,
      }}
    />
  ),
  curitiba: (
    <img
      src={`${ASSETS_BASE}pilotos/curitiba/logo-prefeitura.png`}
      style={{
        width: 45,
        height: 45,
      }}
    />
  ),
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
      leftPanel={{
        categoryIcons: CATEGORY_ICONS,
      }}
    />
  )
}
