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
import { Debug, Flex } from '@orioro/react-ui-core'
import { useMemo, useRef, useState } from 'react'
import { Marker } from 'react-map-gl/maplibre'
import { mdiScanHelper } from '@mdi/js'
import { useQueryClient } from '@tanstack/react-query'
import { Icon } from '@mdi/react'
import {
  mdiAccountGroup,
  mdiSchool,
  mdiHomeCity,
  mdiHospitalBox,
  mdiEarth,
  mdiMap,
} from '@mdi/js'

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

const CATEGORY_ICONS = {
  'populacao-e-domicilios': <Icon path={mdiAccountGroup} />,
  educacao: <Icon path={mdiSchool} />,
  'infraestrutura-e-servicos-urbanos': <Icon path={mdiHomeCity} />,
  saude: <Icon path={mdiHospitalBox} />,
  'emergencias-climaticas': <Icon path={mdiEarth} />,
  'divisoes-territoriais': <Icon path={mdiMap} />,
  mapi: (
    <img
      src="/mapi/mapi_favicon.ico"
      style={{
        width: 36,
        height: 36,
      }}
    />
  ),
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

function mapi_test_view({ mapiDataSrc }) {
  return {
    collection_id: 'MAPI',
    indicator_id: 'MAPI',
    //
    // ATENÇÃO: ID da view não pode ser MAPI porque gera conflito
    // com o id do diretório ("Mapi" vira "mapi" depois de slugificação)
    //
    id: 'mapi_view',
    sourceLabel: 'MAPI',
    path: `Mapi / _ / Mapi`,
    label: 'Mapi',
    shortDescription:
      'Ações concretas de Desenvolvimento Urbano Sustentável mapeadas no Mutirão ReDUS rumo à COP30',
    metadata: {},

    sources: {
      mapi: {
        type: 'geojson',
        data: mapiDataSrc,
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

//
// Para recarregar as visualizações de dados
// - A função toma um bom tempo, é uma boa manter dialog de loading enquanto
//   recarrega
//
async function forceRefetchRenderedViews({ queryClient }) {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        await queryClient.refetchQueries({
          queryKey: ['ViewSpecs'],
        })
        console.log('did refetch ViewSpecs')

        setTimeout(async () => {
          try {
            await queryClient.refetchQueries({
              queryKey: ['ViewStage'],
            })

            resolve()

            console.log('did refetch ViewStage')
          } catch (err) {
            reject(err)
          }
        }, 0)
      } catch (err) {
        reject(err)
      }
    }, 0)
  })
}

export const Basic = () => {
  const queryClient = useQueryClient()

  const geoReDUSRef = useRef(null)

  const [mapiDataSrc, setMapiDataSrc] = useState('/mapi/test-data-sp-2.geojson')

  const VIEW_SPECS = useMemo(() => {
    return {
      all: [
        [
          mapi_test_view({
            mapiDataSrc: mapiDataSrc,
          }),
        ],
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

          ...br_divisao_territorial_views(API),
          ...ana_br_bacias_hidrograficas(API),
          redus_mutirao_cop_2025(API),
        ],
      ],
    }
  }, [mapiDataSrc])

  const [stateStorage, setStateStorage] = useVersionedSearchParamsState(
    {
      //
      // É possível configurar a visualização inicial:
      //
      viewConf: {
        byId: {
          mapi_view: {},
        },
        layout: [{ id: 'left', items: [{ id: 'mapi_view' }] }],
      },
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

  const [currentPoint, setCurrentPoint] = useState(null)

  const [pointPickerActive, setPointPickerActive] = useState(false)

  return (
    <GeoReDUS
      ref={geoReDUSRef}
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
              onMouseMove: (e) => {
                console.log('onMouseMove', e)

                setCurrentPoint(e.point)
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
      svgImages={{
        mdiTree: mdiScanHelper,
      }}
      leftPanel={{
        categoryIcons: CATEGORY_ICONS,
        header: (
          <Flex
            px="12px"
            py="10px"
            height={60}
            alignItems="center"
            direction="row"
            style={{
              backgroundColor: 'var(--accent-9)',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              flexGrow: 0,
            }}
          >
            <div>custom header</div>
          </Flex>
        ),
        footer: (
          <Flex
            p="2"
            style={{
              backgroundColor: 'white',
            }}
            direction="row"
            justifyContent="center"
          >
            <div>custom footer</div>
          </Flex>
        ),
      }}
    >
      <button
        style={{
          position: 'absolute',
          zIndex: 10,
          top: 10,
          right: 10,
        }}
        onClick={(e) => {
          setPointPickerActive(!pointPickerActive)
        }}
      >
        turn point picker {pointPickerActive ? 'off' : 'on'}
      </button>
      <button
        style={{
          position: 'absolute',
          zIndex: 10,
          top: 10,
          right: 100,
        }}
        onClick={async (e) => {
          setMapiDataSrc((currMapiDataSrc) =>
            currMapiDataSrc === '/mapi/test-data-sp.geojson'
              ? '/mapi/test-data-sp-2.geojson'
              : '/mapi/test-data-sp.geojson',
          )

          await forceRefetchRenderedViews({ queryClient })
        }}
      >
        toggle: {mapiDataSrc}
      </button>
    </GeoReDUS>
  )
}
