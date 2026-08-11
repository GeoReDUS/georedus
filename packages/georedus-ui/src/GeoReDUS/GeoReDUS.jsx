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
  useMapRegistry,
  useTilesLoading,
  layeredMapOnClickHandler,
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
import {
  mdiClose,
  mdiSchool,
  mdiHospital,
  mdiTree,
  mdiSprout,
  mdiCurrencyUsd,
  mdiScaleBalance,
  mdiAccountMultipleOutline,
} from '@mdi/js'
import { getSurroundingTilesBbox, resolveInitialMunicipioId } from './util'
import { DialogsProvider, useDialogs } from '../DialogSystem'
import { InputProvider } from '../InputSystem'
import { useViews } from '../viewSpecs/useViews'

import { overture_places_poc } from '../viewSpecs/development/overture_places_poc'

import { vtxSetup } from '../vtxProtocol'

import { dataviz, satellite } from '../viewSpecs/basemaps'

import {
  svgImageGenerator,
  DynamicImages,
  SVG_PATTERNS,
} from '@orioro/react-maplibre-util'

import { SKY_STYLE } from './constants'

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

//
// This is a hotfix for overriding font-size: .875rem
// from @orioro/react-select
//
// Font-size < 16px makes mobile zoom in
//
const HotfixSelectLargeFont = styled.div`
  input {
    font-size: 1rem;
  }
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
    `${METADATA_API_ENDPOINT}/ibge_malha_br_municipio_2024?select=area_urbana_bbox_geom&id=eq.${municipioId}`,
  ).then((res) => res.json())

  if (mun && mun.area_urbana_bbox_geom) {
    fitGeometry(map, mun.area_urbana_bbox_geom, options)
  }

  // const [mun] = await fetch(
  //   `${METADATA_API_ENDPOINT}/ibge_malha_br_municipio?select=bbox&id=eq.${municipioId}`,
  // ).then((res) => res.json())

  // if (mun && mun.bbox) {
  //   console.log('mun.bbox', mun.bbox)

  //   fitGeometry(map, mun.bbox, options)
  // }
}

//
// For elevation rendering
//
const DEM_SOURCE_URL = `https://api.maptiler.com/tiles/terrain-rgb-v2/{z}/{x}/{y}.webp?key=${process.env.NEXT_PUBLIC_MAP_TILER_API_KEY}`
const DEM_SOURCE_ENCODING = 'mapbox'

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

const BASEMAPS = {
  dataviz,
  satellite,
}

const BASE_MAP_STYLE = {
  dataviz: BASEMAPS.dataviz.baseMapStyle(),
  satellite: BASEMAPS.satellite.baseMapStyle(),
}

const FULL_MAP_STYLE = {
  dataviz: BASEMAPS.dataviz.fullMapStyle(),
  satellite: BASEMAPS.satellite.fullMapStyle(),
}

export function _bboxContains(a, b) {
  const [aMinLng, aMinLat, aMaxLng, aMaxLat] = a
  const [bMinLng, bMinLat, bMaxLng, bMaxLat] = b

  return (
    bMinLng >= aMinLng &&
    bMinLat >= aMinLat &&
    bMaxLng <= aMaxLng &&
    bMaxLat <= aMaxLat
  )
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

const DEFAULT_MAP_PROPS = {}
const DEFAULT_SVG_IMAGES = {}
const DEFAULT_LEFT_PANEL_PROPS = {}

function GeoReDUSInner({
  state: globalState,
  onSetState: onSetGlobalState,
  api,
  viewSpecs,

  children = null,

  mapProps = DEFAULT_MAP_PROPS,
  svgImages = DEFAULT_SVG_IMAGES,

  leftPanel: leftPanelProps = DEFAULT_LEFT_PANEL_PROPS,
}) {
  const MAP_SVG_IMAGE_GENERATOR = useMemo(
    () =>
      svgImageGenerator({
        mdiTree,
        mdiSprout,
        mdiCurrencyUsd,
        mdiScaleBalance,
        mdiAccountMultipleOutline,
        mdiSchool,
        mdiHospital,
        ...SVG_PATTERNS,
        ...svgImages,
      }),
    [svgImages],
  )

  const { METADATA_API_ENDPOINT, VECTOR_TILE_SERVER_ENDPOINT } = api

  //
  // TODO: implement utility: useLocalReducer (like useLocalState)
  //
  const [viewConfState, viewConfDispatch] = useReducer(
    viewConfReducer,
    globalState?.viewConf || null,
    viewConfReducerInitialState,
  )

  const [zoomLevel, setZoomLevel] = useState(null)

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
  const mapRegistry = useMapRegistry()
  const tilesLoading = useTilesLoading(mapRegistry.maps)
  const [mapBounds, setMapBounds] = useState(null)

  const [municipioId, setMunicipioId] = useLocalState(
    globalState.municipioId,
    (nextMunicipioId) =>
      onSetGlobalState({
        ...globalState,
        municipioId: nextMunicipioId,
      }),
  )

  const [regional, setRegional] = useLocalState(
    Boolean(globalState.regional),
    (nextRegional) =>
      onSetGlobalState({
        ...globalState,
        regional: nextRegional,
      }),
  )

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
          app: { municipioId },
        }),
        ...(globalState?.env === 'development'
          ? [
              overture_places_poc({
                METADATA_API_ENDPOINT,
                VECTOR_TILE_SERVER_ENDPOINT,
              }),
            ]
          : []),
      ].filter(Boolean)
    },
    throwOnError: process.env.NODE_ENV !== 'production',
  })

  const APP_CONTEXT = useMemo(
    () => ({
      municipioId,
      baseMapStyle,
      viewConfDispatch,
      //
      // Pass only zoomLevel instead of zoom itself
      // in order for views not recompute on every zoom change
      //
      zoomLevel,
      regional,
      mapBounds,
    }),
    [
      municipioId,
      baseMapStyle,
      viewConfDispatch,
      zoomLevel,
      regional,
      mapBounds,
    ],
  )

  const {
    resolvedViews,
    resolvedViewSpecs,
    isLoading: viewsLoading,
  } = useViews({
    viewSpecs: viewSpecsQuery.data,
    viewConfState: viewConfState,
    app: APP_CONTEXT,
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

  const TOP_VIEWS = useMemo(
    () =>
      BASEMAPS[baseMapStyle].topViews({
        api,
        app: APP_CONTEXT,
      }),
    [baseMapStyle, api, APP_CONTEXT],
  )

  const onClick = useMemo(
    () =>
      layeredMapOnClickHandler({
        context: {
          dialogs,
        },
      }),
    [],
  )

  const [commitedViewState, setCommitedViewState] = useState(null)

  return (
    <Flex>
      <LeftPanel
        open={leftPanelOpen}
        onSetOpen={setLeftPanelOpen}
        viewSpecs={resolvedViewSpecs}
        viewConfState={viewConfState}
        viewConfDispatch={viewConfDispatch}
        resolvedViews={resolvedViews}
        resolvedLayout={resolvedLayout}
        
        // props required for export image
        commitedViewState={commitedViewState}
        municipioId={municipioId}
        METADATA_API_ENDPOINT={METADATA_API_ENDPOINT}
        baseMapStyle={BASE_MAP_STYLE[baseMapStyle]}
        topViews={TOP_VIEWS}
        
        {...leftPanelProps}
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
        alignItems="center">
        <ViewLayoutPopover
          viewSpecs={viewSpecsQuery.data}
          viewConfState={viewConfState}
          viewConfDispatch={viewConfDispatch}
        />

        <Flex
          alignItems="strecth"
          width="400px"
          direction="column"
          maxWidth="30vw"
          gap="3">
          <HotfixSelectLargeFont>
            <Input
              schema={MUNICIPIO_ID_SELECTOR_SCHEMA}
              value={municipioId}
              onSetValue={setMunicipioId}
            />
          </HotfixSelectLargeFont>
          <div
            style={{
              alignSelf: 'flex-end',
              position: 'absolute',
              top: '100%',
            }}>
            <Input
              schema={{
                type: 'booleanCheckbox',
                description: 'Visualizar dados regionais',
              }}
              size="1"
              value={regional}
              onSetValue={setRegional}
            />
          </div>
        </Flex>
      </Flex>

      <SyncedMaps
        maxPitch={80}
        onZoomEnd={(e) => {
          const zoom = e.viewState?.zoom
          const nextZoomLevel =
            zoom > 8
              ? 'intramun'
              : zoom > 5
                ? 'intrauf'
                : zoom > 3
                  ? 'intrabr'
                  : null

          setZoomLevel(nextZoomLevel)
        }}
        //
        // TODO: review mapBounds calculation
        //
        onMoveEnd={(e) => {
  
          setCommitedViewState(e.viewState)
          const { latitude, longitude } = e.viewState
          const bounds = e.target.getBounds()
          const minLng = bounds.getWest()
          const maxLng = bounds.getEast()
          const minLat = bounds.getSouth()
          const maxLat = bounds.getNorth()

          const viewBounds = [minLng, minLat, maxLng, maxLat]

          if (!mapBounds || !_bboxContains(mapBounds, viewBounds)) {
            setMapBounds(getSurroundingTilesBbox(longitude, latitude, 7))
          }
        }}
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
        onLoad={(evt) => {
          _refocus(evt.target)

          // For debugging:
          // evt.target.showTileBoundaries = true

          mapRegistry.onLoad(evt)
        }}
        onRemove={(evt) => {
          mapRegistry.onRemove(evt)
        }}
        onClick={onClick}
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
        mapStyle={BASE_MAP_STYLE[baseMapStyle]}
        sky={SKY_STYLE}
        tooltip={getTooltip}
        {...mapProps}
        maps={resolvedLayout.map(({ id, views, legends }, index) => ({
          id,
          views: [...views.concat([]).reverse(), ...TOP_VIEWS],

          //
          // Required for exporting map:
          //
          // canvasContextAttributes: {
          //   preserveDrawingBuffer: true,
          // },
          children: (
            <>
              <DynamicImages onGenerateImage={MAP_SVG_IMAGE_GENERATOR} />

              <AttributionControl position="bottom-right" compact={false} />

              <ControlContainer
                style={{
                  width: 'auto',
                  height: 'auto',
                  boxShadow: 'none',
                  opacity: legends.length > 0 ? 1 : 0,
                }}
                position="bottom-right">
                {legends.length > 0 && (
                  <LegendContainer
                    direction="row"
                    gap="3"
                    p={resolvedLayout.length > 1 ? '3' : '4'}>
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
                          }>
                          <Icon path={mdiClose} size="20px" />
                        </IconButton>
                      </Tooltip>
                    )}

                    <EvenSpacedList
                      columns={legends.length > 1 ? 2 : 1}
                      gap="10px"
                      style={{ maxWidth: '300px' }}>
                      {legends.map((legend) => (
                        <HoverLegend
                          {...(resolvedLayout.length > 1
                            ? {
                                direction: 'row',
                                size: '1',
                              }
                            : {
                                direction: 'column',
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
                  {process.env.NODE_ENV !== 'production' && <InspectControl />}
                  <GeolocateControl position="top-right" />
                  <FullscreenControl position="top-right" />
                  <NavigationControl position="top-right" />
                  <ScaleControl position="bottom-right" />

                  <ControlContainer
                    style={{
                      width: 100,
                      height: 100,
                      boxShadow: 'none',
                    }}>
                    <MapStyleToggleCtrl
                      style={{
                        position: 'relative',
                        width: 100,
                        height: 100,
                      }}
                      type="button"
                      onClick={() =>
                        setBaseMapStyle(
                          baseMapStyle === 'dataviz' ? 'satellite' : 'dataviz',
                        )
                      }>
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
                            ? FULL_MAP_STYLE.dataviz
                            : FULL_MAP_STYLE.satellite
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

              {mapProps.children || null}
            </>
          ),
        }))}>
        {(viewsLoading || tilesLoading) && (
          <LoadingIndicator
            style={{
              position: 'fixed',
              bottom: '40px',
              right: '20px',
              zIndex: 20,
            }}
            message={null}
          />
        )}
      </SyncedMaps>
      {children}
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
