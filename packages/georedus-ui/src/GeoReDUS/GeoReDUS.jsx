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
} from '@orioro/react-maplibre-util'
import { Legend } from '@orioro/react-chart-util'
import 'maplibre-gl/dist/maplibre-gl.css'

import { useQueries, useQuery } from '@tanstack/react-query'
import { resolveView } from '../viewSpecs/resolveView'
import { HoverTooltip, TerrainControl } from '@orioro/react-maplibre-util'
import {
  NavigationControl,
  ScaleControl,
  GeolocateControl,
  AttributionControl,
  FullscreenControl,
} from 'react-map-gl/maplibre'

import { fetchViewSpecs, resolveViewSpecs } from '../viewSpecs'
import styled from 'styled-components'
import { viewConfReducer, viewConfReducerInitialState } from './viewConfReducer'
import { get, isPlainObject } from 'lodash'
import { IconButton, Tooltip } from '@radix-ui/themes'
import { Icon } from '@mdi/react'
import { mdiClose } from '@mdi/js'
import { csvParse } from 'd3-dsv'
import { resolveInitialMunicipioId } from './util'
import { DialogsProvider, useDialogs } from '../DialogSystem'
import { InputProvider } from '../InputSystem'

//
// List of municipio ids that are in the RM (Regiões Metropolitanas) dataset
//
const RM_MUNICIPIO_IDS_CEM = '/georedus/data/cem_rm_municipio_ids_20250401.csv'

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
// const REDUS_DATAVIZ_STYLE =
//   'https://api.maptiler.com/maps/streets-v2/style.json'
// const MAP_STYLE_URL = `https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.NEXT_PUBLIC_MAP_TILER_API_KEY}`
const DATAVIZ_MAP_STYLE_URL = `${REDUS_DATAVIZ_STYLE}?key=${process.env.NEXT_PUBLIC_MAP_TILER_API_KEY}`
const SATELLITE_MAP_STYLE_URL = `https://api.maptiler.com/maps/satellite/style.json?key=${process.env.NEXT_PUBLIC_MAP_TILER_API_KEY}`
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
// Custom queryKeyHashFn that correctly handles files
//
// https://github.com/TanStack/query/blob/ff788ac4e0a9cbc6af6cdf1837fcbf5c0b0b9a9c/packages/query-core/src/utils.ts#L217
//
export function queryKeyHashFnWithFileSupport(queryKey) {
  return JSON.stringify(queryKey, (_, val) => {
    if (val instanceof File) {
      // Replace File with stable metadata representation
      return {
        __file__: true,
        name: val.name,
        size: val.size,
        type: val.type,
        lastModified: val.lastModified,
      }
    }

    return isPlainObject(val)
      ? Object.keys(val)
          .sort()
          .reduce((result, key) => {
            result[key] = val[key]
            return result
          }, {})
      : val
  })
}

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
      //
      // Load municipio ids that have SAUDE and EDUCACAO
      // datasets
      //
      const RM_MUNICIPIO_IDS = csvParse(
        await fetch(RM_MUNICIPIO_IDS_CEM).then((res) => res.text()),
      )

      const SPEC_SRCS = municipioId
        ? RM_MUNICIPIO_IDS.some((m) => m.id_municipio === municipioId)
          ? viewSpecs.all
          : viewSpecs.censo_only
        : []

      return resolveViewSpecs(await fetchViewSpecs(SPEC_SRCS), {
        METADATA_API_ENDPOINT,
        VECTOR_TILE_SERVER_ENDPOINT,
        MAP_TILER_API_KEY: process.env.NEXT_PUBLIC_MAP_TILER_API_KEY,
      })
    },
    throwOnError: process.env.NODE_ENV !== 'production',
  })

  const viewSpecsById = useMemo(
    () =>
      Array.isArray(viewSpecsQuery.data)
        ? viewSpecsQuery.data.reduce(
            (acc, viewSpec) => ({
              ...acc,
              [viewSpec.id]: viewSpec,
            }),
            {},
          )
        : null,
    [viewSpecsQuery.data],
  )

  const viewsQueries = useQueries({
    queries: viewConfState.layout
      .flatMap((list) => list.items.map((item) => item.id))
      .map((viewId) => {
        return {
          queryKey: [
            'ResolveView',
            viewId,
            municipioId,
            viewSpecsById ? viewSpecsById[viewId] : null,
            viewConfState.byId[viewId],
          ],
          queryKeyHashFn: queryKeyHashFnWithFileSupport,
          queryFn: async () => {
            const viewSpec = viewSpecsById
              ? viewSpecsById[viewId]
              : viewSpecsById

            return viewSpec
              ? resolveView(viewSpec, viewConfState.byId[viewId], {
                  municipioId,
                  baseMapStyle,
                })
              : null
          },
          throwOnError: true,
          retry: false,
        }
      }),
  })

  const resolvedViews = useMemo(
    () =>
      viewsQueries
        // .filter((query) => query.status === 'success')
        .map((query) => query.data)
        .filter(Boolean),
    [viewsQueries],
  )

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
    ).map((list) => {
      const views = list.items
        .map((item) => resolvedViewsById[item.id])
        .filter(Boolean)

      return {
        id: list.id,
        views,
        legends: views.flatMap((view) => view?.legends || []),
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

  const isLoading = viewsQueries.some(
    (viewQuery) => viewQuery.status === 'pending',
  )

  return (
    <Flex>
      <LeftPanel
        open={leftPanelOpen}
        onSetOpen={setLeftPanelOpen}
        viewSpecs={viewSpecsQuery.data}
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
        style={{ position: 'fixed', top: 0, bottom: 0, left: '60px', right: 0 }}
        setPrefetchZoomDelta={0}
        mapStyle={
          baseMapStyle === 'satellite'
            ? SATELLITE_MAP_STYLE_URL
            : DATAVIZ_MAP_STYLE_URL
        }
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
                        <Legend
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
                          baseMapStyle === 'dataviz' ? 'satellite' : 'dataviz',
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
