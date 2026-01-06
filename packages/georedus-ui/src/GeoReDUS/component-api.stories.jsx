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
  Z_OVERLAY_MIDDLE_2000,
} from '../viewSpecs'
import { Debug } from '@orioro/react-ui-core'
import { useState } from 'react'
import { Marker } from 'react-map-gl/maplibre'

export default {
  title: 'GeoReDUS / Component API',
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

// const GOOGLE_CEM_CENSO_2010 =
//   'https://docs.google.com/spreadsheets/d/e/' +
//   '2PACX-1vQ7R3I_EjXhXkNK5OE4qUG_uiSg9qZrPIzzVPtj0fNA4EympIWzQA4KkFt6TNwp6RYH7ZgaJrDJ4z6J' +
//   '/pub?gid=' +
//   '2016686120' +
//   '&single=true&output=csv'

// const GOOGLE_CEM_CENSO_2022 =
//   'https://docs.google.com/spreadsheets/d/e/' +
//   '2PACX-1vQ7R3I_EjXhXkNK5OE4qUG_uiSg9qZrPIzzVPtj0fNA4EympIWzQA4KkFt6TNwp6RYH7ZgaJrDJ4z6J' +
//   '/pub?gid=' +
//   '1523585495' +
//   '&single=true&output=csv'

// const GOOGLE_CEM_ESCOLAS_2022 =
//   'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7R3I_EjXhXkNK5OE4qUG_uiSg9qZrPIzzVPtj0fNA4EympIWzQA4KkFt6TNwp6RYH7ZgaJrDJ4z6J/pub?gid=1942442229&single=true&output=csv'

// const GOOGLE_CEM_SAUDE_2024 =
//   'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7R3I_EjXhXkNK5OE4qUG_uiSg9qZrPIzzVPtj0fNA4EympIWzQA4KkFt6TNwp6RYH7ZgaJrDJ4z6J/pub?gid=1332018097&single=true&output=csv'

// const VIEW_SPECS = {
//   all: [
//     hand({
//       ...API,
//       mosaicJsonUrl: `${RASTER_TILE_ROOT_PATH}/cem/hand_2018/mosaic.json`,
//     }),
//     // GOOGLE_CEM_CENSO_2022,
//     // GOOGLE_CEM_CENSO_2010,
//     // GOOGLE_CEM_ESCOLAS_2022,
//     // GOOGLE_CEM_SAUDE_2024,

//     // [
//     //   // declividade({
//     //   //   ...API,
//     //   //   mosaicJsonUrl: `${RASTER_TILE_ROOT_PATH}/cem/declividade_2018/mosaic.json`,
//     //   // }),
//     //   // temperatura_superficie({
//     //   //   ...API,
//     //   //   mosaicJsonUrl: `${RASTER_TILE_ROOT_PATH}/cem/temperatura_superficie_2021_2025/mosaic.json`,
//     //   // }),
//     //   // curvatura({
//     //   //   ...API,
//     //   //   mosaicJsonUrl: `${RASTER_TILE_ROOT_PATH}/cem/curvatura_2018/mosaic.json`,
//     //   // }),
//     //   // overture_places_poc(API),
//     //   //
//     //   // ...br_divisao_territorial_views(API),
//     //   // ...ana_br_bacias_hidrograficas(API),
//     // ],
//   ],
// }

function mapi_test_view() {
  return {
    collection_id: 'MAPI',
    indicator_id: 'MAPI',
    id: 'mapi',
    sourceLabel: 'MAPI',
    path: `Emergências Climáticas / _ / Mapi`,
    label: 'Mapi',
    shortDescription:
      'Ações concretas de Desenvolvimento Urbano Sustentável mapeadas no Mutirão ReDUS rumo à COP30',
    metadata: {},

    sources: {
      mapi: {
        type: 'geojson',
        data: `/mapi/test-data-sp.geojson`,
      },
    },
    layers: {
      circle: {
        zIndex: Z_OVERLAY_MIDDLE_2000,

        source: 'mapi',
        type: 'circle',
        paint: {
          'circle-opacity': 1,
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            5,
            10, // at zoom 5 → radius 10
            15,
            15, // at zoom 15 → radius 15
          ],
          'circle-stroke-width': 1,
          'circle-stroke-color': '#000000',
          'circle-color': '#3E63DD',
          // 'circle-color': [
          //   'match',
          //   ['get', 'eixos_cop_30_primeiro'],
          //   ...LEGEND_ITEMS.map((item) => [item.value, item.color]).flat(),
          //   // default
          //   schemeCategory10[7],
          // ],
        },
        onClick: async (feature, e, context) => {
          const evaluation = await context.dialogs.prompt({
            type: 'object',
            properties: {
              grade: {
                type: 'radio',
                options: [
                  {
                    value: 1,
                    label: '1',
                  },
                  {
                    value: 2,
                    label: '2',
                  },
                ],
              },
            },
          })

          console.log(evaluation.grade)

          await context.dialogs.view(
            <div>
              <div>Hello</div>
              <Debug data={feature} />
            </div>,
          )
        },

        // tooltip: {},
        // legends: []
      },
    },
  }
}

const VIEW_SPECS = {
  all: [
    // hand({
    //   ...API,
    //   mosaicJsonUrl: `${RASTER_TILE_ROOT_PATH}/cem/hand_2018/mosaic.json`,
    // }),
    redus_mutirao_cop_2025(API),
    mapi_test_view(),
  ],
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

  const [pointPickerActive, setPointPickerActive] = useState(false)

  return (
    <GeoReDUS
      state={stateStorage}
      onSetState={setStateStorage}
      viewSpecs={VIEW_SPECS}
      api={API}
      mapProps={
        pointPickerActive
          ? {
              onClick: (e) => {
                alert(`pick point at ${JSON.stringify(e.point)}`)

                setPointPickerActive(false)
                // esse evento é o evento padrão
              },
              children: (
                <Marker longitude={-46.3336} latitude={-23.9608}>
                  <div
                    style={{
                      background: 'red',
                      width: 30,
                      height: 30,
                    }}
                  >
                    X
                  </div>
                </Marker>
              ),
            }
          : {}
      }
    >
      <button
        style={{
          position: 'absolute',
          zIndex: 10,
          top: 10,
          left: 10,
        }}
        onClick={(e) => {
          setPointPickerActive(!pointPickerActive)
        }}
      >
        turn point picker {pointPickerActive ? 'off' : 'on'}
      </button>
    </GeoReDUS>
  )
}
