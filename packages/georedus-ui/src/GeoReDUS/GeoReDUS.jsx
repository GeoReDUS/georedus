import React from 'react'
import {
  EvenSpacedList,
  Flex,
  Input,
  LoadingIndicator,
  useLocalState,
} from '@orioro/react-ui-core'
import { LeftPanel } from '../LeftPanel'
import { ViewLayoutPopover } from '../ViewLayoutPopover'
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import {
  LayeredMap,
  fitGeometry,
  makeSyncedMaps,
  MapWindow,
  ControlContainer,
  InspectControl,
  useLayeredMap,
} from '@orioro/react-maplibre-util'
import '@maplibre/maplibre-gl-inspect/dist/maplibre-gl-inspect.css'
import { Legend } from '@orioro/react-chart-util'
import 'maplibre-gl/dist/maplibre-gl.css'

import { useQuery } from '@tanstack/react-query'
import { HoverTooltip, TerrainControl } from '@orioro/react-maplibre-util'
import {
  NavigationControl,
  ScaleControl,
  GeolocateControl,
  AttributionControl,
  FullscreenControl,
  useMap,
} from 'react-map-gl/maplibre'

import { fetchViewSpecs, resolveViewSpecs } from '../viewSpecs'
import styled from 'styled-components'
import { viewConfReducer, viewConfReducerInitialState } from './viewConfReducer'
import { get } from 'lodash'
import { IconButton, Tooltip } from '@radix-ui/themes'
import { Icon } from '@mdi/react'
import { mdiClose } from '@mdi/js'
import { resolveInitialMunicipioId } from './util'
import { DialogsProvider, useDialogs } from '../DialogSystem'
import { InputProvider } from '../InputSystem'
import { useViews } from '../viewSpecs/useViews'
import { useMapStyle } from './useMapStyle'
import { tableVectorSource } from '../viewSpecs/util'

import { vtxSetup } from '../vtxProtocol'

//
// Sets up vtx:// protocol
//
vtxSetup()

const LegendContainer = styled(Flex)`
  box-shadow:
    rgba(0, 0, 0, 0.1) 0px 4px 6px -1px,
    rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;
  background-color: white;
  border-radius: 4px;
`

const SyncedMaps = makeSyncedMaps({
  components: {
    Map: LayeredMap,
  },
})

const BASE_MAP_PADDING = 50
const SIDE_BAR_OPEN_MAP_PADDING = 320
const MULTI_MAP_VIEW_BOTTOM_PADDING = 170

async function _flyToMunicipio(
  map,
  METADATA_API_ENDPOINT,
  municipioId,
  options,
) {
  const [mun] = await fetch(
    `${METADATA_API_ENDPOINT}/ibge_malha_br_municipio?select=bbox&id=eq.${municipioId}`,
  ).then((res) => res.json())

  if (mun && mun.bbox) {
    fitGeometry(map, mun.bbox, options)
  }
}

//
// We use a customizable style on maptiler
//
const REDUS_DATAVIZ_STYLE =
  'https://api.maptiler.com/maps/0195f947-fb77-7256-83d6-47a54db345a3/style.json'
const REDUS_SATELLITE_STYLE =
  'https://api.maptiler.com/maps/0196a042-ce24-74d5-8c4a-aacddb89c9ca/style.json'
// const REDUS_DATAVIZ_STYLE =
//   'https://api.maptiler.com/maps/streets-v2/style.json'
// const MAP_STYLE_URL = `https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.NEXT_PUBLIC_MAP_TILER_API_KEY}`
const DATAVIZ_MAP_STYLE_URL = `${REDUS_DATAVIZ_STYLE}?key=${process.env.NEXT_PUBLIC_MAP_TILER_API_KEY}`
const SATELLITE_MAP_STYLE_URL = `${REDUS_SATELLITE_STYLE}?key=${process.env.NEXT_PUBLIC_MAP_TILER_API_KEY}`
//
// For elevation rendering
//
const DEM_SOURCE_URL = `https://api.maptiler.com/tiles/terrain-rgb-v2/{z}/{x}/{y}.webp?key=${process.env.NEXT_PUBLIC_MAP_TILER_API_KEY}`
const DEM_SOURCE_ENCODING = 'mapbox'

const GLYPHS_URL = `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${process.env.NEXT_PUBLIC_MAP_TILER_API_KEY}`

const MapStyleToggleCtrl = styled.button`
  height: 100px;
  width: 100px;

  padding: 0;
  border: none;
  background-color: #efefef;
  border-radius: 0;
  box-shadow:
    rgba(50, 50, 93, 0.25) 0px 2px 5px -1px,
    rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;

  cursor: pointer;

  &::after {
    z-index: 2;
    content: 'Trocar camada base';
    color: transparent;
    font-weight: bold;
    display: flex;
    padding: 8px;
    justify-content: center;
    align-items: center;
    text-align: center;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: rgba(0, 0, 0, 0);
    transition: background 0.1s ease-in-out;
  }

  &:hover {
    &::after {
      background: rgba(0, 0, 0, 0.5);
      color: white;
    }
  }

  @media (max-width: 500px) {
    height: 50px;
    width: 50px;
    &::after {
      font-size: 0.6rem;
    }
  }
`

//
// From:
// https://servicodados.ibge.gov.br/api/v4/malhas/paises/BR/metadados
//
const DEFAULT_INITIAL_VIEW_STATE = {
  // // Brazil
  longitude: -53.0736,
  latitude: -10.7798,
  zoom: 3.5,
}

//
// From:
// https://servicodados.ibge.gov.br/api/v4/malhas/paises/BR/metadados
//
const BR_BBOX = {
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [-73.9904, 5.2718],
        [-28.8476, -33.7512],
        [-73.9904, 5.2718],
      ],
    ],
  },
  properties: {},
}

const SKY_STYLE = {
  'sky-color': '#199EF3',
  'sky-horizon-blend': 0.5,
  'horizon-color': '#d3edfd',
  'horizon-fog-blend': 0.5,
  'fog-color': '#0000ff',
  'fog-ground-blend': 0.5,
  'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 10, 1, 12, 0],
}

//
// TODO: review, this is clearly not a structured way
// of doing this
//
function HoverLegend({ layerId, __filterFeaturesForStep, ...legendProps }) {
  const mapRef = useMap()

  const SEQUENTIAL_COLOR_LEGEND_PROPS = useMemo(() => {
    const onMouseEnterStep = (stepInfo) => {
      const map = mapRef.current?.getMap()

      if (!map) {
        return
      }

      const targetFeatures = __filterFeaturesForStep(
        stepInfo,
        map.queryRenderedFeatures(undefined, {
          layers: [layerId],
        }),
      )

      for (const feature of targetFeatures) {
        map.setFeatureState(feature, {
          hover: true,
        })
      }
    }

    const onMouseLeaveStep = () => {
      const map = mapRef.current?.getMap()

      if (!map) {
        return
      }

      const layerRenderedFeatures = map.queryRenderedFeatures(undefined, {
        layers: [layerId],
      })

      for (const feature of layerRenderedFeatures) {
        map.setFeatureState(feature, {
          hover: false,
        })
      }
    }

    return {
      onMouseEnterStep,
      onMouseLeaveStep,
    }
  }, [])

  return (
    <Legend
      {...legendProps}
      {...(legendProps.type === 'SequentialColorLegend'
        ? SEQUENTIAL_COLOR_LEGEND_PROPS
        : {})}
    />
  )
}

function GeoReDUSInner({
  state: globalState,
  onSetState: onSetGlobalState,
  api,
  viewSpecs,
}) {
  const { METADATA_API_ENDPOINT, VECTOR_TILE_SERVER_ENDPOINT } = api

  //
  // TODO: implement utility: useLocalReducer (like useLocalState)
  //
  const [viewConfState, viewConfDispatch] = useReducer(
    viewConfReducer,
    globalState?.viewConf || null,
    viewConfReducerInitialState,
  )

  //
  // Sync viewConfState to external globalState
  //
  useEffect(() => {
    onSetGlobalState({
      ...globalState,
      viewConf: viewConfState,
    })
  }, [viewConfState])

  const [leftPanelOpen, setLeftPanelOpen] = useState(true)

  useEffect(() => {
    if (window.innerWidth < 700) {
      setLeftPanelOpen(false)
    }
  }, [])

  const syncedMapsRef = useRef(null)

  const [municipioId, setMunicipioId] = useLocalState(
    globalState.municipioId,
    (nextMunicipioId) =>
      onSetGlobalState({
        ...globalState,
        municipioId: nextMunicipioId,
      }),
  )

  const regionMunicipioIdsQuery = useQuery({
    queryKey: ['AdjacentMunicipioIds', municipioId],
    queryFn: async () => {
      const [mun] = await fetch(
        `${METADATA_API_ENDPOINT}/ibge_malha_br_municipio?select=regiao_imediata_id&id=eq.${municipioId}`,
      ).then((response) => response.json())

      const adjacendMuns = await fetch(
        `${METADATA_API_ENDPOINT}/ibge_malha_br_municipio?select=id&regiao_imediata_id=eq.${mun.regiao_imediata_id}`,
      ).then((response) => response.json())

      return adjacendMuns.map((mun) => mun.id)
    },
    enabled: Boolean(municipioId),
    throwOnError: process.env.NODE_ENV !== 'production',
  })

  const [baseMapStyle, setBaseMapStyle] = useLocalState(
    globalState.baseMapStyle || 'dataviz',
    (nextBaseMapStyle) =>
      onSetGlobalState({
        ...globalState,
        baseMapStyle: nextBaseMapStyle,
      }),
  )

  //
  // Query that resolves viewSpecs
  //
  const viewSpecsQuery = useQuery({
    queryKey: ['ViewSpecs', municipioId],
    queryFn: async () => {
      const SPEC_SRCS = viewSpecs.all

      return [
        ...resolveViewSpecs(await fetchViewSpecs(SPEC_SRCS), {
          METADATA_API_ENDPOINT,
          VECTOR_TILE_SERVER_ENDPOINT,
          MAP_TILER_API_KEY: process.env.NEXT_PUBLIC_MAP_TILER_API_KEY,
        }),
        globalState?.env === 'development'
          ? {
              id: 'overture_places_poc',
              label: 'Pontos de atividade comercial',
              sourceLabel: 'Overture Maps',
              path: 'Infraestrutura e serviços urbanos / 2022 / Atividade comercial',
              metadata: {},
              sources: {
                atividade_comercial: tableVectorSource(
                  {
                    VECTOR_TILE_SERVER_ENDPOINT,
                  },
                  'overture_br_places',
                  {
                    attribution: 'Overture Maps',
                    minzoom: 10,
                  },
                ),
              },
              layers: {
                atividade_comercial: {
                  source: 'atividade_comercial',
                  'source-layer': 'overture_br_places.geom',
                  filter: [
                    '==',
                    ['get', 'municipio_id'],
                    ['$get', 'app.municipioId'],
                  ],
                  type: 'circle',
                  paint: {
                    'circle-radius': 2, // small circle size
                    'circle-color': '#3E63DD', // red fill
                    'circle-opacity': [
                      'interpolate',
                      ['linear'],
                      ['zoom'],
                      10,
                      0.1,
                      16,
                      0.4,
                    ],
                    // 'circle-stroke-width': .5, // no outline
                    // 'circle-stroke-color': '#ff0000', // no outline
                  },

                  // type: 'heatmap',
                  // paint: {
                  //   // Increase the heatmap weight based on frequency and property magnitude
                  //   'heatmap-weight': [
                  //     'interpolate',
                  //     ['linear'],
                  //     ['get', 'mag'],
                  //     0,
                  //     0,
                  //     6,
                  //     1,
                  //   ],
                  //   // Increase the heatmap color weight weight by zoom level
                  //   // heatmap-intensity is a multiplier on top of heatmap-weight
                  //   'heatmap-intensity': [
                  //     'interpolate',
                  //     ['linear'],
                  //     ['zoom'],
                  //     0,
                  //     1,
                  //     9,
                  //     3,
                  //   ],
                  //   // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
                  //   // Begin color ramp at 0-stop with a 0-transparency color
                  //   // to create a blur-like effect.
                  //   'heatmap-color': [
                  //     'interpolate',
                  //     ['linear'],
                  //     ['heatmap-density'],
                  //     0,
                  //     'rgba(33,102,172,0)',
                  //     0.2,
                  //     'rgb(103,169,207)',
                  //     0.4,
                  //     'rgb(209,229,240)',
                  //     0.6,
                  //     'rgb(253,219,199)',
                  //     0.8,
                  //     'rgb(239,138,98)',
                  //     1,
                  //     'rgb(178,24,43)',
                  //   ],
                  //   // Adjust the heatmap radius by zoom level
                  //   'heatmap-radius': [
                  //     'interpolate',
                  //     ['linear'],
                  //     ['zoom'],
                  //     0,
                  //     2,
                  //     9,
                  //     20,
                  //   ],
                  // },
                },
              },
            }
          : null,
      ].filter(Boolean)
    },
    throwOnError: process.env.NODE_ENV !== 'production',
  })

  const { resolvedViews, resolvedViewSpecs, isLoading } = useViews({
    viewSpecs: viewSpecsQuery.data,
    viewConfState: viewConfState,
    app: {
      municipioId,
      regionMunicipioIds:
        regionMunicipioIdsQuery.status === 'success'
          ? regionMunicipioIdsQuery.data
          : null,
      baseMapStyle,
    },
    enabled: regionMunicipioIdsQuery.status === 'success',
  })

  //
  // Prepares layout for rendering
  //
  const resolvedLayout = useMemo(() => {
    const resolvedViewsById = Object.fromEntries(
      resolvedViews.map((view) => [view.id, view]),
    )

    const hasActiveViews = Object.keys(viewConfState.byId).length > 0

    return (
      hasActiveViews
        ? //
          // In case there are active views, filter layout lists
          // for non-empty lists
          //
          viewConfState.layout.filter((list) => list.items.length > 0)
        : //
          // Otherwise, return the first list, in order to ensure at least
          // empty map rendering
          //
          [viewConfState.layout[0]]
    ).map((list, index) => {
      const views = list.items
        .map((item) => resolvedViewsById[item.id])
        .filter(Boolean)

      return {
        id: list.id,
        views,
        legends: views.flatMap((view) => view?.controls?.legends || []),
      }
    })
  }, [viewConfState.layout, viewConfState.byId, resolvedViews])

  useEffect(() => {
    if (resolvedLayout.length > 1) {
      setTimeout(() => {
        setLeftPanelOpen(false)
      }, 100)
    }
  }, [resolvedLayout.length])

  //
  // Compute fit geometry options given ui settings
  //
  const FIT_GEOMETRY_OPTIONS = useMemo(
    () => ({
      padding: {
        top: BASE_MAP_PADDING,
        bottom:
          resolvedLayout.length > 1
            ? MULTI_MAP_VIEW_BOTTOM_PADDING
            : BASE_MAP_PADDING,
        left:
          leftPanelOpen && resolvedLayout.length === 1
            ? SIDE_BAR_OPEN_MAP_PADDING
            : BASE_MAP_PADDING,
        right: BASE_MAP_PADDING,
      },
    }),
    [resolvedLayout, leftPanelOpen],
  )

  const _refocus = (mapInstance) => {
    if (!municipioId) {
      fitGeometry(mapInstance, BR_BBOX, {
        ...FIT_GEOMETRY_OPTIONS,
        // Immediate
        // duration: 0,
      })
    } else {
      _flyToMunicipio(
        mapInstance,
        METADATA_API_ENDPOINT,
        municipioId,
        FIT_GEOMETRY_OPTIONS,
      )
    }
  }

  const MUNICIPIO_ID_SELECTOR_SCHEMA = {
    type: 'select',
    required: true,
    clearable: false,
    placeholder: 'Selecione um município',
    options: useCallback(async () => {
      // https://dev-geoapi-metadata.orioro.design/ibge_malha_br_municipio?select=nome,id
      const municipios = await fetch(
        `${METADATA_API_ENDPOINT}/ibge_malha_br_municipio?select=nome,id,uf_sigla`,
      ).then((response) => response.json())

      // const municipios = await fetch(
      //   'https://servicodados.ibge.gov.br/api/v1/localidades/municipios?view=nivelado',
      // ).then((response) => response.json())

      return municipios.map((mun) => ({
        label: `${mun['nome']} (${mun['uf_sigla']})`,
        value: mun['id'] + '',
      }))
    }, []),
  }

  const dialogs = useDialogs()

  //
  // Initial focus
  //
  useEffect(() => {
    if (!municipioId) {
      resolveInitialMunicipioId({
        METADATA_API_ENDPOINT,
        coordinates: null,
      }).then(async (resolvedMunicipioId) => {
        if (!resolvedMunicipioId) {
          let selectedMunicipioId = null

          while (typeof selectedMunicipioId !== 'string') {
            selectedMunicipioId = await dialogs.prompt({
              input: { ...MUNICIPIO_ID_SELECTOR_SCHEMA, label: 'Município' },
              submit: 'Ir para o município',
              cancel: null,
            })
          }

          setMunicipioId(selectedMunicipioId)
        } else {
          setTimeout(() => setMunicipioId(resolvedMunicipioId), 400)
        }
      })
    }
  }, [])

  //
  // Control map position focus
  //
  useEffect(() => {
    const mainMap = get(syncedMapsRef.current, 'mapInstances[0].map')

    if (!mainMap) {
      return
    }

    _refocus(mainMap)
  }, [municipioId, resolvedLayout.length])

  //
  // Tooltip getter
  //
  const getTooltip = useCallback((hoverInfo, layeredMap) => {
    if (!layeredMap.map) {
      return null
    }

    const interactiveFeatures = layeredMap.map
      //
      // Query all rendered features
      //
      .queryRenderedFeatures(hoverInfo.event.point)
      //
      // Load the source view they are associated with
      //
      .map((feature) => layeredMap.augmentFeature(feature))
      //
      // Remove features with no associated view
      //
      .filter(({ mapView }) => Boolean(mapView))

    if (interactiveFeatures.length > 0) {
      const tooltipDataSections = interactiveFeatures
        .flatMap((feature) => {
          const tooltipSpec = feature.layer?.tooltip

          return tooltipSpec
            ? tooltipSpec({
                feature,
              })
            : null
        })
        .filter(Boolean)

      return (
        tooltipDataSections.length > 0 && (
          <HoverTooltip
            position={hoverInfo.point}
            dataSections={tooltipDataSections}
            style={{ zIndex: 99999, right: 10 }}
          />
        )
      )
    } else {
      return null
    }
  }, [])

  const mapStyle = useMapStyle(
    baseMapStyle === 'satellite'
      ? SATELLITE_MAP_STYLE_URL
      : DATAVIZ_MAP_STYLE_URL,
    (styleBase) => {
      return {
        ...styleBase,
        glyphs: GLYPHS_URL,
        sprite: 'https://api.maptiler.com/maps/dataviz/sprite',
      }
    },
  )

  return (
    <Flex>
      <LeftPanel
        open={leftPanelOpen}
        onSetOpen={setLeftPanelOpen}
        viewSpecs={resolvedViewSpecs}
        viewConfState={viewConfState}
        viewConfDispatch={viewConfDispatch}
        resolvedViews={resolvedViews}
        syncedMapsRef={syncedMapsRef}
      />

      <Flex
        style={{
          position: 'fixed',
          zIndex: 2,
          right: '50px',
          top: '10px',
        }}
        direction="row"
        gap="4"
        alignItems="center"
      >
        <ViewLayoutPopover
          viewSpecs={viewSpecsQuery.data}
          viewConfState={viewConfState}
          viewConfDispatch={viewConfDispatch}
        />

        <Flex alignItems="strecth" width="400px" maxWidth="30vw">
          <Input
            schema={MUNICIPIO_ID_SELECTOR_SCHEMA}
            value={municipioId}
            onSetValue={setMunicipioId}
          />
        </Flex>
      </Flex>

      {mapStyle && (
        <SyncedMaps
          maxPitch={80}
          onDrag={() => {
            if (resolvedLayout.length > 1 && leftPanelOpen) {
              //
              // In case there are two open maps, on drag close
              // left panel
              //
              setLeftPanelOpen(false)
            }
          }}
          ref={syncedMapsRef}
          onLoad={async (event) => _refocus(event.target)}
          attributionControl={false}
          initialViewState={DEFAULT_INITIAL_VIEW_STATE}
          style={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: '60px',
            right: 0,
          }}
          setPrefetchZoomDelta={0}
          mapStyle={mapStyle}
          sky={SKY_STYLE}
          tooltip={getTooltip}
          maps={resolvedLayout.map(({ id, views, legends }, index) => ({
            id,
            views,

            //
            // Required for exporting map:
            //
            // canvasContextAttributes: {
            //   preserveDrawingBuffer: true,
            // },
            children: (
              <>
                <AttributionControl position="bottom-right" compact={false} />

                <ControlContainer
                  style={{
                    width: 'auto',
                    height: 'auto',
                    boxShadow: 'none',
                    opacity: legends.length > 0 ? 1 : 0,
                  }}
                  position="bottom-right"
                >
                  {legends.length > 0 && (
                    <LegendContainer
                      direction="row"
                      gap="3"
                      p={resolvedLayout.length > 1 ? '3' : '4'}
                    >
                      {resolvedLayout.length > 1 && (
                        <Tooltip content="Fechar visualização">
                          <IconButton
                            size="1"
                            variant="soft"
                            onClick={() =>
                              viewConfDispatch({
                                type: 'DEACTIVATE_VIEW',
                                payload: views[0].id,
                              })
                            }
                          >
                            <Icon path={mdiClose} size="20px" />
                          </IconButton>
                        </Tooltip>
                      )}

                      <EvenSpacedList
                        columns={legends.length > 1 ? 2 : 1}
                        gap="10px"
                      >
                        {legends.map((legend) => (
                          <HoverLegend
                            {...(resolvedLayout.length > 1
                              ? {
                                  direction: 'row',
                                  maxWidth: '300px',
                                  size: '1',
                                }
                              : {
                                  direction: 'column',
                                  maxWidth: '150px',
                                  size: '2',
                                })}
                            key={legend.id}
                            {...legend}
                          />
                        ))}
                      </EvenSpacedList>
                    </LegendContainer>
                  )}
                </ControlContainer>

                {index === resolvedLayout.length - 1 ? (
                  <>
                    {process.env.NODE_ENV !== 'production' && (
                      <InspectControl />
                    )}
                    <GeolocateControl position="top-right" />
                    <FullscreenControl position="top-right" />
                    <NavigationControl position="top-right" />
                    <ScaleControl position="bottom-right" />

                    <ControlContainer
                      style={{
                        width: 100,
                        height: 100,
                        boxShadow: 'none',
                      }}
                    >
                      <MapStyleToggleCtrl
                        style={{
                          position: 'relative',
                          width: 100,
                          height: 100,
                        }}
                        type="button"
                        onClick={() =>
                          setBaseMapStyle(
                            baseMapStyle === 'dataviz'
                              ? 'satellite'
                              : 'dataviz',
                          )
                        }
                      >
                        <MapWindow
                          style={{
                            pointerEvents: 'none',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '100%',
                            width: '100%',
                          }}
                          mapStyle={
                            baseMapStyle === 'satellite'
                              ? DATAVIZ_MAP_STYLE_URL
                              : SATELLITE_MAP_STYLE_URL
                          }
                          maxZoom={13}
                        />
                      </MapStyleToggleCtrl>
                    </ControlContainer>
                  </>
                ) : null}

                <TerrainControl
                  demSourceUrl={DEM_SOURCE_URL}
                  demSourceEncoding={DEM_SOURCE_ENCODING}
                />
              </>
            ),
          }))}
        >
          {isLoading && (
            <LoadingIndicator
              style={{
                position: 'fixed',
                bottom: '10px',
                right: '10px',
                zIndex: 20,
              }}
            />
          )}
        </SyncedMaps>
      )}
    </Flex>
  )
}

const GeoReDUSRootContainer = styled.div`
  * {
    box-sizing: border-box;
  }
`

export function GeoReDUS(props) {
  return (
    <GeoReDUSRootContainer>
      <InputProvider variant="labeled">
        <DialogsProvider>
          <GeoReDUSInner {...props} />
        </DialogsProvider>
      </InputProvider>
    </GeoReDUSRootContainer>
  )
}
