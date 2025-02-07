import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { useQueries } from '@tanstack/react-query'

import { LayeredMap } from '../LayeredMap'
import { $naturalBreaks } from '../scales'

import { fitGeometry } from '../util'
import { LayeredMapProps, MapView, MapViewLayer, MapViewSource } from '../types'
import { schemePuBuGn } from 'd3-scale-chromatic'
import { Flex } from '@orioro/react-ui-core'
import { Legend } from '@orioro/react-chart-util'
import { useHover } from '../useHover'
import { HoverTooltip } from '../HoverTooltip'
import { useDebounce } from 'react-use'

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
        $naturalBreaks,
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

  const viewId = `${TABLE_ID}.${VARIABLE_ID}`

  const NUMBER_FMT = ['pt-BR', { style: 'percent' }]

  return [
    viewId,
    [
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
        id: viewId,
        label: variableId,
        legends: [
          {
            type: 'SequentialColorLegend',
            title: 'Taxa de alfabetização',
            unit: '% relativa à unidade territorial',
            format: {
              number: NUMBER_FMT,
            },
            steps: ['$naturalBreaks', ['$get', 'variableValues']],
          },
        ],
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
            interactive: true,

            tooltip: [
              '$literal',
              {
                title: [
                  '$literal',
                  [
                    '$template',
                    'Setor ${0}',
                    ['$get', 'feature.properties.cd_geocodi'],
                  ],
                ],
                entries: [
                  [
                    'Taxa de alfabetização',
                    [
                      '$literal',
                      [
                        '$get',
                        `feature.properties.${VARIABLE_ID}::string({ "number": ${JSON.stringify(NUMBER_FMT)} })`,
                      ],
                    ],
                  ],
                  [
                    'Pessoas Residentes',
                    [
                      '$literal',
                      [
                        '$get',
                        `feature.properties.pop_bas_mor_tot_pes::string`,
                      ],
                    ],
                  ],
                ],
              },
            ],
            source: VECTOR_SOURCE_ID,
            'source-layer': VECTOR_SOURCE_ID,
            type: 'fill',
            filter: ['==', ['get', 'cod_municipio'], ['$get', 'municipioId']],
            paint: {
              'fill-color': [
                '$flat',
                [
                  ['step', ['get', VARIABLE_ID]],
                  ['$naturalBreaks', ['$get', 'variableValues']],
                ],
              ],
              'fill-opacity': 0.5,
              'fill-outline-color': 'transparent',
            },
          },
        },
      },
    ],
  ]
}

function cem_educacao_escolas_2022({
  variableId,
}: {
  variableId: string
} & Partial<MapView>): MapView {
  const TABLE_ID = 'cem_educacao_escolas_2022'
  const VECTOR_SOURCE_ID = `${TABLE_ID}.geom`
  const VARIABLE_ID = variableId

  const SIZING_VARIABLE_ID = 'qt_mat_fund_ai'

  const globalRes = globalResources()

  const viewId = `${TABLE_ID}.${VARIABLE_ID}`

  return [
    viewId,
    [
      '$let',
      {
        variableValues: [
          '$filter',
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
          [
            '$and',
            ['$not', ['$empty', ['$iterator', 'item']]],
            ['$lte', ['$iterator', 'item'], 100],
          ],
        ],
        sizingValues: [
          '$filter',
          [
            '$get',
            `[].${SIZING_VARIABLE_ID}`,
            [
              '$fetch',
              [
                '$template',
                `${METADATA_API_ENDPOINT}/${TABLE_ID}?select=${SIZING_VARIABLE_ID}&co_municipio=eq.\$\{0\}`,
                ['$context', 'municipioId'],
              ],
            ],
          ],
          ['$and', ['$not', ['$empty', ['$iterator', 'item']]]],
        ],
      },
      {
        id: viewId,
        legends: [
          {
            type: 'SequentialColorLegend',
            title: variableId,
            unit: `${variableId}_unit`,
            steps: [
              '$naturalBreaks',
              ['$get', 'variableValues'],
              {
                scalesByK: schemePuBuGn,
              },
            ],
          },
        ],
        sources: {
          ...globalRes.sources,
          [VECTOR_SOURCE_ID]: tableVectorSource(TABLE_ID, {
            minzoom: 9,
            maxzoom: 20,
          }),
        },
        layers: {
          ...globalRes.layers,
          [`${VECTOR_SOURCE_ID}_circle` as string]: vectorLayer(
            VECTOR_SOURCE_ID,
            {
              type: 'circle',
              interactive: true,
              tooltip: [
                '$literal',
                {
                  title: [
                    '$literal',
                    ['$get', 'feature.properties.no_entidade'],
                  ],
                  entries: [
                    [
                      VARIABLE_ID,
                      [
                        '$literal',
                        [
                          '$get',
                          `feature.properties.${VARIABLE_ID}::string({ "number": ["pt-BR"] })`,
                        ],
                      ],
                    ],
                  ],
                },
              ],
              filter: [
                'all',
                ['==', ['get', 'co_municipio'], ['$get', 'municipioId']],
                ['==', ['typeof', ['get', VARIABLE_ID]], 'number'],
                // ['<=', ['get', VARIABLE_ID], 100],
              ],
              paint: {
                'circle-opacity': 1,
                'circle-radius': [
                  'interpolate',
                  ['linear'],
                  ['get', SIZING_VARIABLE_ID], // Replace "density" with your property name
                  ['$min', ['$get', 'sizingValues']],
                  6, // When qt_mat_fund_ai is 0, radius is 6
                  ['$max', ['$get', 'sizingValues']],
                  20, // When qt_mat_fund_ai is 100, radius is 20
                ],
                // 'circle-radius': ['get', 'qt_mat_fund_ai'],
                'circle-color': [
                  '$flat',
                  [
                    ['step', ['get', VARIABLE_ID]],
                    [
                      '$naturalBreaks',
                      ['$get', 'variableValues'],
                      {
                        scalesByK: schemePuBuGn,
                      },
                    ],
                  ],
                ],
              },
            },
          ),
        },
      },
    ],
  ]
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
  (acc, view) =>
    Array.isArray(view)
      ? {
          ...acc,
          [view[0]]: view[1],
        }
      : {
          ...acc,
          [view.id]: view,
        },
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
    Object.keys(VIEW_SPECS_BY_ID),
  )

  const viewsQueries = useQueries({
    queries: activeViewIds.map((viewId) => ({
      queryKey: ['ResolveView', viewId, municipioId],
      queryFn: async () => {
        return resolveAsync(VIEW_SPECS_BY_ID[viewId], {
          municipioId,
        })
      },
      throwOnError: true,
    })),
  })

  const resolvedViews = useMemo(
    () =>
      viewsQueries
        .filter((query) => query.status === 'success')
        .map((query) => query.data),
    [viewsQueries],
  )

  const mainMapRef = useRef<MapInstance | null>(null)
  const [viewState, setViewState] = useState<
    Omit<LayeredMapProps, 'views' | 'onMove'>
  >({
    latitude: -1.455833,
    longitude: -48.503887,
    zoom: 10,
  })
  const onMove = useCallback((evt) => setViewState(evt.viewState), [])

  // useDebounce(
  //   async () => {
  //     if (!mainMapRef.current) {
  //       return
  //     }

  //     const bounds = mainMapRef.current.getBounds() // Get map view bounds

  //     const [intersecting] = await fetch(
  //       `${METADATA_API_ENDPOINT}/rpc/get_intersecting_ibge_malha_br_municipio`,
  //       {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Accept: 'application/json',
  //         },
  //         body: JSON.stringify({
  //           input_geojson: {
  //             type: 'Point',
  //             coordinates: [viewState.longitude, viewState.latitude], // GeoJSON uses [longitude, latitude]
  //           },
  //         }),
  //         // body: JSON.stringify({
  //         //   input_geojson: {
  //         //     type: 'Polygon',
  //         //     coordinates: [
  //         //       [
  //         //         [bounds.getWest(), bounds.getSouth()], // Bottom-left
  //         //         [bounds.getEast(), bounds.getSouth()], // Bottom-right
  //         //         [bounds.getEast(), bounds.getNorth()], // Top-right
  //         //         [bounds.getWest(), bounds.getNorth()], // Top-left
  //         //         [bounds.getWest(), bounds.getSouth()], // Closing the polygon
  //         //       ],
  //         //     ],
  //         //   },
  //         // }),
  //       },
  //     ).then((res) => res.json())

  //     if (intersecting) {
  //       setMunicipioId(intersecting.id)
  //     }
  //   },
  //   1000,
  //   [viewState],
  // )

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

  //
  // Hover stuff
  //
  const [{ children: hoverChildren, ...hoverProps }, hoverInfo, isDragging] =
    useHover(
      {
        tooltip: ({ point, features }) => {
          const tooltipDataSections = features
            .flatMap((feature) => {
              const tooltipSpec = feature.layer?.tooltip

              return tooltipSpec
                ? resolve(tooltipSpec, {
                    mapView: feature.mapView,
                    feature,
                  })
                : null
            })
            .filter(Boolean)

          return (
            tooltipDataSections.length > 0 && (
              <HoverTooltip
                position={point}
                dataSections={tooltipDataSections}
              />
            )
          )
        },
      },
      [],
    )

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
          {...hoverProps}
          cursor={
            isDragging
              ? 'grabbing'
              : hoverInfo?.features?.length > 0
                ? 'default'
                : 'grab'
          }
          onMove={onMove}
          style={{ width: '100vw', height: '100vh' }}
          mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.STORYBOOK_MAP_TILER_API_KEY}`}
        >
          {hoverChildren}
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
              {resolvedViews
                .flatMap((view) =>
                  view.legends
                    ? view.legends.map((legend, index) => ({
                        ...legend,
                        id: `${view.id}_${index}`,
                      }))
                    : [],
                )
                .map((legend) => (
                  <Legend key={legend.id} {...legend} />
                ))}
            </Flex>
          </div>
        </LayeredMap>
      </div>
    </>
  )
}
