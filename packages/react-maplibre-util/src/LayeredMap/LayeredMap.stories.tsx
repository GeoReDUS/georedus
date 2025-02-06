import React, { useCallback, useEffect, useRef, useState } from 'react'
import Map, {
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
  Layer,
  Source,
  MapInstance,
  AnyLayer,
} from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css' // See notes below
import { createGlobalStyle } from 'styled-components'
import { SelectInput } from '@orioro/react-select'
import {
  $$literal,
  expressions,
  makeResolve,
  withExpressionResolvers,
  ALL_EXPR,
  fetchExpr,
} from '@orioro/resolve'

import { LayeredMap } from '../LayeredMap'
import { $scaleNaturalBreaks } from '../scales'
import { fitGeometry } from '../util'
import { LayeredMapProps, MapView, MapViewLayer, MapViewSource } from '../types'
import { schemePuBuGn } from 'd3-scale-chromatic'
import { ColorLegend } from '@orioro/react-chart-util'
import { Flex } from '@orioro/react-ui-core'

export default {
  title: 'LayeredMap',
  parameters: {
    layout: 'fullscreen',
  },
}

const GlobalStyle = createGlobalStyle`
  body {
    font-family: sans-serif;
  }
`
const METADATA_API_ENDPOINT = `http://localhost:6001`
const VECTOR_TILE_SERVER_ENDPOINT = `http://localhost:6002`

const { resolveAsync, resolve } = makeResolve({
  resolvers: withExpressionResolvers(
    expressions.syntaxArrayExpr({
      name: '$$logical',
      symbol: Symbol.for('$$logical'),
      // @ts-ignore
      exps: {
        ...ALL_EXPR,
        $fetch: fetchExpr({
          isFetchAllowed: fetchExpr.allowOrigins({
            [METADATA_API_ENDPOINT]: ['GET'],
          }),
        }),
        $scaleNaturalBreaks,
      },
    }).resolver,
  ),
  defaultResolver: $$literal,
})

function tableVectorSource(
  tableId: string,
  override: Partial<MapViewSource> = {},
): MapViewSource {
  return {
    type: 'vector',
    tiles: [`${VECTOR_TILE_SERVER_ENDPOINT}/${tableId}.geom/{z}/{x}/{y}`],
    minzoom: 9,
    maxzoom: 20,
    ...override,
  } as MapViewSource
}

function vectorLayer(
  sourceId: string,
  override: Omit<AnyLayer, 'source' | 'source-layer' | 'id'>,
): MapViewLayer {
  return {
    source: sourceId,
    'source-layer': sourceId,
    ...override,
  } as MapViewLayer
}

function globalResources() {
  const MUNICIPIO_MALHA_TABLE_ID = 'ibge_malha_br_municipio'

  return {
    sources: {
      global_municipio: tableVectorSource(MUNICIPIO_MALHA_TABLE_ID, {
        absoluteId: MUNICIPIO_MALHA_TABLE_ID,
        minzoom: 4,
        maxzoom: 20,
      }),
    },
    layers: {
      municipio: {
        absoluteId: MUNICIPIO_MALHA_TABLE_ID,
        absoluteSourceId: MUNICIPIO_MALHA_TABLE_ID,
        'source-layer': `${MUNICIPIO_MALHA_TABLE_ID}.geom`,
        type: 'line',
        filter: ['==', ['get', 'id'], ['$get', 'municipioId']],
        paint: {
          'line-color': '#0000FF', // Line color
          'line-width': 4, // Line width
          'line-opacity': 0.5,
          // 'line-dasharray': [2, 4], // Dash pattern
        },
      },
    },
  }
}

function cem_censo_2010({
  variableId,
  ...override
}: {
  variableId: string
} & Partial<MapView>): MapView | any[] {
  const TABLE_ID = 'cem_censo_2010'
  const VECTOR_SOURCE_ID = `${TABLE_ID}.geom`
  const VARIABLE_ID = variableId

  const globalRes = globalResources()

  return [
    '$let',
    'variableValues',
    [
      '$get',
      `[].${VARIABLE_ID}`,
      [
        '$fetch',
        [
          '$template',
          `${METADATA_API_ENDPOINT}/${TABLE_ID}?select=${VARIABLE_ID}&cod_municipio=eq.\$\{0\}`,
          ['$context', 'municipioId'],
        ],
      ],
    ],
    {
      id: `${TABLE_ID}.${VARIABLE_ID}`,
      label: variableId,
      sources: {
        ...globalRes.sources,
        [VECTOR_SOURCE_ID]: tableVectorSource(TABLE_ID, {
          minzoom: 9,
          maxzoom: 20,
        }),
      },
      layers: {
        ...globalRes.layers,
        [`${VECTOR_SOURCE_ID}_fill`]: {
          source: VECTOR_SOURCE_ID,
          'source-layer': VECTOR_SOURCE_ID,
          type: 'fill',
          filter: ['==', ['get', 'cod_municipio'], ['$get', 'municipioId']],
          paint: {
            'fill-color': [
              '$scaleNaturalBreaks',
              VARIABLE_ID,
              ['$get', 'variableValues'],
            ],
            'fill-opacity': 0.5,
            'fill-outline-color': 'transparent',
          },
        },
      },
    },
  ]

  // return {
  //   id: `${TABLE_ID}.${VARIABLE_ID}`,
  //   label: variableId,
  //   sources: {
  //     ...globalRes.sources,
  //     [VECTOR_SOURCE_ID]: tableVectorSource(TABLE_ID, {
  //       minzoom: 9,
  //       maxzoom: 20,
  //     }),
  //   },
  //   layers: {
  //     ...globalRes.layers,
  //     [`${VECTOR_SOURCE_ID}_fill`]: {
  //       source: VECTOR_SOURCE_ID,
  //       'source-layer': VECTOR_SOURCE_ID,
  //       type: 'fill',
  //       filter: ['==', ['get', 'cod_municipio'], ['$get', 'municipioId']],
  //       paint: {
  //         'fill-color': [
  //           '$scaleNaturalBreaks',
  //           VARIABLE_ID,
  //           [
  //             '$get',
  //             `[].${VARIABLE_ID}`,
  //             [
  //               '$fetch',
  //               [
  //                 '$template',
  //                 `${METADATA_API_ENDPOINT}/${TABLE_ID}?select=${VARIABLE_ID}&cod_municipio=eq.\$\{0\}`,
  //                 ['$context', 'municipioId'],
  //               ],
  //             ],
  //           ],
  //         ],
  //         'fill-opacity': 0.5,
  //         'fill-outline-color': 'transparent',
  //       },
  //     },
  //   },
  // }
}

function cem_educacao_escolas_2022({
  variableId,
}: {
  variableId: string
} & Partial<MapView>): MapView {
  const TABLE_ID = 'cem_educacao_escolas_2022'
  const VECTOR_SOURCE_ID = `${TABLE_ID}.geom`
  const VARIABLE_ID = variableId

  const globalRes = globalResources()

  return {
    id: `${TABLE_ID}.${VARIABLE_ID}`,
    sources: {
      ...globalRes.sources,
      [VECTOR_SOURCE_ID]: tableVectorSource(TABLE_ID, {
        minzoom: 9,
        maxzoom: 20,
      }),
    },
    layers: {
      ...globalRes.layers,
      [`${VECTOR_SOURCE_ID}_circle` as string]: vectorLayer(VECTOR_SOURCE_ID, {
        type: 'circle',
        filter: ['==', ['get', 'co_municipio'], ['$get', 'municipioId']],
        paint: {
          'circle-opacity': 1,
          'circle-radius': 6,
          // 'circle-color': '#00D0F0',

          'circle-color': [
            '$scaleNaturalBreaks',
            VARIABLE_ID,
            [
              '$get',
              `[].${VARIABLE_ID}`,
              [
                '$fetch',
                [
                  '$template',
                  `${METADATA_API_ENDPOINT}/${TABLE_ID}?select=${VARIABLE_ID}&co_municipio=eq.\$\{0\}`,
                  ['$context', 'municipioId'],
                ],
              ],
            ],
            {
              colorScale: schemePuBuGn,
            },
          ],
        },
      }),
    },
  }
}

const presets = {
  cem_censo_2010,
  cem_educacao_escolas_2022,
}

const VIEW_SPECS = [
  presets.cem_censo_2010({
    variableId: 'pop_alf_mor_tot_10_14_pct',
  }),
  presets.cem_educacao_escolas_2022({
    variableId: 'ideb_fund_ai',
  }),
]

const VIEW_SPECS_BY_ID = VIEW_SPECS.reduce(
  (acc, view) => ({
    ...acc,
    [view.id]: view,
  }),
  {},
)

const municipioOptions = async () => {
  const data = await fetch(
    `${METADATA_API_ENDPOINT}/ibge_malha_br_municipio?select=nome,uf_sigla,id,centroid`,
  ).then((res) => res.json())

  return data.map((mun) => ({
    label: `${mun.nome} (${mun.uf_sigla})`,
    value: mun.id,
  }))
}

export const Basic = () => {
  const [municipioId, setMunicipioId] = useState<string | undefined>(undefined)
  const [activeViewIds, setActiveViewIds] = useState(
    VIEW_SPECS.map((v) => v.id),
  )
  const [resolvedViews, setResolvedViews] = useState([])

  console.log(resolvedViews)

  useEffect(() => {
    async function resolveViews() {
      if (!municipioId) {
        setResolvedViews([])
        return
      }

      const nextActiveViews = await resolveAsync(
        activeViewIds.map((viewId) => VIEW_SPECS_BY_ID[viewId]),
        {
          municipioId,
        },
      )

      setResolvedViews(nextActiveViews)
    }

    resolveViews()
  }, [municipioId, activeViewIds])

  const mainMapRef = useRef<MapInstance | null>(null)
  const [viewState, setViewState] = useState<
    Omit<LayeredMapProps, 'views' | 'onMove'>
  >({
    latitude: -1.455833,
    longitude: -48.503887,
    zoom: 10,
  })
  const onMove = useCallback((evt) => setViewState(evt.viewState), [])

  useEffect(() => {
    async function flyToMunicipio() {
      if (!mainMapRef.current || !municipioId) {
        return
      }

      const [mun] = await fetch(
        `${METADATA_API_ENDPOINT}/ibge_malha_br_municipio?select=bbox&id=eq.${municipioId}`,
      ).then((res) => res.json())

      if (mun && mun.bbox) {
        fitGeometry(mainMapRef.current, mun.bbox)
      }
    }

    flyToMunicipio()
  }, [municipioId])

  useEffect(() => setMunicipioId('1501402'), [])

  console.log(resolvedViews)

  return (
    <>
      <GlobalStyle />
      <div
        style={{
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            fontFamily: 'sans-serif',
            top: 10,
            left: 10,
            zIndex: 2,
            width: 300,
          }}
        >
          <SelectInput
            options={municipioOptions}
            value={municipioId}
            onSetValue={setMunicipioId}
          />
        </div>
        <LayeredMap
          views={resolvedViews}
          ref={mainMapRef}
          {...viewState}
          onMove={onMove}
          style={{ width: '100vw', height: '100vh' }}
          mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.STORYBOOK_MAP_TILER_API_KEY}`}
        >
          <GeolocateControl position="top-right" />
          <FullscreenControl position="top-right" />
          <NavigationControl position="top-right" />
          <ScaleControl />

          <div
            style={{
              position: 'absolute',
              bottom: 40,
              right: 10,
            }}
          >
            <Flex direction="row" gap="10px">
              {resolvedViews.map((view) => (
                <ColorLegend
                  items={[
                    {
                      id: '1',
                      color: 'rgb(84, 39, 143)',
                      label: 'More than 0.08',
                    },
                    {
                      id: '2',
                      color: 'rgb(117, 107, 177)',
                      label: '0.06 to 0.08',
                    },
                    {
                      id: '3',
                      color: 'rgb(158, 154, 200)',
                      label: '0.04 to 0.06',
                    },
                    {
                      id: '4',
                      color: '#bcbddc',
                      label: '0.02 to 0.04',
                    },
                    {
                      id: '5',
                      color: '#dadaeb',
                      label: '0.01 to 0.02',
                    },
                    {
                      id: '6',
                      color: '#f2f0f7',
                      label: 'Less than 0.01',
                    },
                  ]}
                />
              ))}
            </Flex>
          </div>
        </LayeredMap>
      </div>
    </>
  )
}
