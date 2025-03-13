import {
  Box,
  EvenSpacedList,
  Flex,
  Input,
  LoadingIndicator,
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
} from '@orioro/react-maplibre-util'
import { Legend } from '@orioro/react-chart-util'
import 'maplibre-gl/dist/maplibre-gl.css'

import { useQueries, useQuery } from '@tanstack/react-query'
import { resolveView } from '../viewSpecs/resolveView'
import { HoverTooltip } from '@orioro/react-maplibre-util'
import {
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
  AttributionControl,
} from 'react-map-gl/maplibre'

import { fetchViewSpecs, resolveViewSpecs } from '../viewSpecs'
import styled from 'styled-components'
import { viewConfReducer, viewConfReducerInitialState } from './viewConfReducer'
import { get } from 'lodash'
import { IconButton, Tooltip } from '@radix-ui/themes'
import Icon from '@mdi/react'
import { mdiClose, mdiLayers } from '@mdi/js'

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

const GOOGLE_SHEETS_VIEW_SPECS = [
  GOOGLE_CEM_CENSO_2010,
  GOOGLE_CEM_CENSO_2022,
  GOOGLE_CEM_ESCOLAS_2022,
  GOOGLE_CEM_SAUDE_2024,
]

const BUILT_IN_CEM_CENSO_2010 = '/georedus/data/cem_censo_2010.csv'
const BUILT_IN_CEM_CENSO_2022 = '/georedus/data/cem_censo_2022.csv'
const BUILT_IN_CEM_ESCOLAS_2022 = '/georedus/data/cem_escolas_2022.csv'
const BUILT_IN_CEM_SAUDE_2024 = '/georedus/data/cem_saude_2024.csv'

const BUILT_IN_VIEW_SPECS = [
  BUILT_IN_CEM_CENSO_2010,
  BUILT_IN_CEM_CENSO_2022,
  BUILT_IN_CEM_ESCOLAS_2022,
  BUILT_IN_CEM_SAUDE_2024,
]

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

const MAP_STYLE_URL = `https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.NEXT_PUBLIC_MAP_TILER_API_KEY}`

export function GeoReDUS({ api }) {
  const { METADATA_API_ENDPOINT, VECTOR_TILE_SERVER_ENDPOINT } = api

  const [viewConfState, viewConfDispatch] = useReducer(
    viewConfReducer,
    null,
    viewConfReducerInitialState,
  )

  console.log({ viewConfState })

  const [leftPanelOpen, setLeftPanelOpen] = useState(true)

  const syncedMapsRef = useRef(null)

  const [municipioId, setMunicipioId] = useState(
    // Belém
    '1501402',
    // São Paulo
    // '3550308',
  )

  const [viewState, setViewState] = useState({
    // Belém
    latitude: -1.455833,
    longitude: -48.503887,

    // São Paulo
    // latitude: -23.533773,
    // longitude: -46.62529,
    zoom: 10,
  })
  // const onMove = useCallback((evt) => setViewState(evt.viewState), [])

  const [viewSpecSources, setViewSpecSources] = useState(
    // BUILT_IN_VIEW_SPECS,
    GOOGLE_SHEETS_VIEW_SPECS,
  )
  const viewSpecsQuery = useQuery({
    queryKey: ['ViewSpecs', viewSpecSources],
    queryFn: async () =>
      resolveViewSpecs(await fetchViewSpecs(viewSpecSources), {
        METADATA_API_ENDPOINT,
        VECTOR_TILE_SERVER_ENDPOINT,
        MAP_TILER_API_KEY: process.env.NEXT_PUBLIC_MAP_TILER_API_KEY,
      }),
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
          queryFn: async () => {
            const viewSpec = viewSpecsById
              ? viewSpecsById[viewId]
              : viewSpecsById

            return viewSpec
              ? resolveView(viewSpec, viewConfState.byId[viewId], {
                  municipioId,
                })
              : null
          },
          throwOnError: true,
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

  console.log('viewConfState', viewConfState)

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
      console.log('auto close panel', resolvedLayout.length > 1)

      setTimeout(() => {
        setLeftPanelOpen(false)
      }, 100)
    }
  }, [resolvedLayout.length])

  console.log('hello')
  const _refocus = (mapInstance) => {
    _flyToMunicipio(mapInstance, METADATA_API_ENDPOINT, municipioId, {
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
    })
  }

  useEffect(() => {
    //
    // Fly to
    //
    const mainMap = get(syncedMapsRef.current, 'mapInstances[0].map')

    if (!mainMap || !municipioId) {
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
        viewSpecSources={viewSpecSources}
        onSetViewSpecSources={setViewSpecSources}
      />

      <ViewLayoutPopover
        viewSpecs={viewSpecsQuery.data}
        viewConfState={viewConfState}
        viewConfDispatch={viewConfDispatch}
        style={{
          position: 'fixed',
          zIndex: 2,
          left: '50%',
          top: '10px',
          transform: 'translateX(-50%)',
        }}
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
        <Flex alignItems="strecth" width="400px" maxWidth="30vw">
          <Input
            schema={{
              type: 'select',
              clearable: false,
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
            }}
            value={municipioId}
            onSetValue={setMunicipioId}
          />
        </Flex>
      </Flex>

      <SyncedMaps
        ref={syncedMapsRef}
        onLoad={async (event) => _refocus(event.target)}
        attributionControl={false}
        initialViewState={viewState}
        style={{ position: 'fixed', top: 0, bottom: 0, left: '60px', right: 0 }}
        setPrefetchZoomDelta={0}
        mapStyle={MAP_STYLE_URL}
        tooltip={getTooltip}
        maps={resolvedLayout.map(({ id, views, legends }, index) => ({
          id,
          views,
          children: (
            <>
              {legends.length > 0 && (
                <LegendContainer
                  direction="row"
                  gap="3"
                  style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '10px',
                    // [resolvedLayout.length > 1 && index === 0
                    //   ? 'left'
                    //   : 'right']: '20px',
                    zIndex: 20,
                  }}
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
              {index === resolvedLayout.length - 1 ? (
                <>
                  <GeolocateControl position="top-right" />
                  <FullscreenControl position="top-right" />
                  <NavigationControl position="top-right" />
                  <ScaleControl position="top-right" />
                  <AttributionControl position="bottom-right" compact={false} />
                </>
              ) : null}
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
