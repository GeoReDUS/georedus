import {
  Box,
  EvenSpacedList,
  Flex,
  Input,
  LoadingIndicator,
  entriesByIdInitialState,
  entriesByIdReducer,
} from '@orioro/react-ui-core'
import { LeftPanel } from '../LeftPanel'
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

import { METADATA_API_ENDPOINT } from '../viewSpecs/constants'
import { useQueries, useQuery } from '@tanstack/react-query'
import { resolveView } from '../viewSpecs/resolveView'
import { withHover } from '@orioro/react-maplibre-util'
import { HoverTooltip } from '@orioro/react-maplibre-util'
import {
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
} from 'react-map-gl/maplibre'

import { fetchViewSpecs, resolveViewSpecs } from '../viewSpecs'
import styled from 'styled-components'
import { viewConfReducer } from './viewConfReducer'
import { get } from 'lodash'
import { IconButton } from '@radix-ui/themes'
import Icon from '@mdi/react'
import { mdiClose } from '@mdi/js'

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

const LegendContainer = styled(Box)`
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

async function _flyToMunicipio(map, municipioId) {
  const [mun] = await fetch(
    `${METADATA_API_ENDPOINT}/ibge_malha_br_municipio?select=bbox&id=eq.${municipioId}`,
  ).then((res) => res.json())

  if (mun && mun.bbox) {
    fitGeometry(map, mun.bbox)
  }
}

export function GeoReDUS() {
  const [viewConfState, viewConfDispatch] = useReducer(viewConfReducer, {
    byId: {},
    layout: [[]],
  })

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
    BUILT_IN_VIEW_SPECS,
    // GOOGLE_SHEETS_VIEW_SPECS,
  )
  const viewSpecsQuery = useQuery({
    queryKey: ['ViewSpecs', viewSpecSources],
    queryFn: async () =>
      resolveViewSpecs(await fetchViewSpecs(viewSpecSources)),
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
    queries: viewConfState.layout.flat(1).map((viewId) => {
      return {
        queryKey: [
          'ResolveView',
          viewId,
          municipioId,
          viewSpecsById ? viewSpecsById[viewId] : null,
          viewConfState.byId[viewId],
        ],
        queryFn: async () => {
          const viewSpec = viewSpecsById ? viewSpecsById[viewId] : viewSpecsById

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

  const resolvedLayout = useMemo(() => {
    const resolvedViewsById = Object.fromEntries(
      resolvedViews.map((view) => [view.id, view]),
    )

    return viewConfState.layout
      .map((viewIdList) =>
        viewIdList.map((viewId) => resolvedViewsById[viewId]).filter(Boolean),
      )
      .map((views) => ({
        views,
        legends: views.flatMap((view) => view?.legends || []),
      }))
  }, [viewConfState.layout, resolvedViews])

  useEffect(() => {
    if (resolvedLayout.length > 1) {
      console.log('auto close panel', resolvedLayout.length > 1)

      setTimeout(() => {
        setLeftPanelOpen(false)
      }, 10)
    }
  }, [resolvedLayout.length])

  console.log('hello')

  //
  // Fly to
  //
  const mainMap = get(syncedMapsRef.current, 'mapInstances[0].map')

  useEffect(() => {
    if (!mainMap || !municipioId) {
      return
    }

    _flyToMunicipio(mainMap, municipioId)
  }, [municipioId, mainMap])

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

  console.log({
    isLoading,
  })

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

      <Flex
        style={{
          width: '400px',
          position: 'fixed',
          zIndex: 2,
          right: '50px',
          top: '10px',
        }}
        alignItems="stretch"
      >
        <Input
          schema={{
            type: 'select',
            options: useCallback(async () => {
              const municipios = await fetch(
                'https://servicodados.ibge.gov.br/api/v1/localidades/municipios?view=nivelado',
              ).then((response) => response.json())

              return municipios.map((mun) => ({
                label: `${mun['municipio-nome']} (${mun['UF-sigla']})`,
                value: mun['municipio-id'] + '',
              }))
            }, []),
          }}
          value={municipioId}
          onSetValue={setMunicipioId}
        />
      </Flex>

      <SyncedMaps
        ref={syncedMapsRef}
        onLoad={async (event) => {
          _flyToMunicipio(event.target, municipioId)
        }}
        initialViewState={viewState}
        style={{ position: 'fixed', top: 0, bottom: 0, left: '60px', right: 0 }}
        setPrefetchZoomDelta={0}
        mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.NEXT_PUBLIC_MAP_TILER_API_KEY}`}
        tooltip={getTooltip}
        maps={resolvedLayout.map(({ views, legends }, index) => ({
          views,
          children: (
            <>
              {legends.length > 0 && (
                <LegendContainer
                  style={{
                    position: 'absolute',
                    bottom: '50px',
                    [resolvedLayout.length > 1 && index === 0
                      ? 'left'
                      : 'right']: '20px',
                    zIndex: 20,
                  }}
                  p="4"
                >
                  <EvenSpacedList
                    columns={legends.length > 1 ? 2 : 1}
                    gap="10px"
                  >
                    {legends.map((legend) => (
                      <Legend maxWidth="140px" key={legend.id} {...legend} />
                    ))}
                  </EvenSpacedList>
                </LegendContainer>
              )}
              {index > 0 ? (
                <IconButton
                  onClick={() =>
                    viewConfDispatch({
                      type: 'DEACTIVATE_VIEW',
                      payload: views[0].id,
                    })
                  }
                  style={{
                    position: 'absolute',
                    zIndex: 10,
                    top: 20,
                    left: 20,
                  }}
                >
                  <Icon path={mdiClose} size="20px" />
                </IconButton>
              ) : null}
              {index === resolvedLayout.length - 1 ? (
                <>
                  <GeolocateControl position="top-right" />
                  <FullscreenControl position="top-right" />
                  <NavigationControl position="top-right" />
                  <ScaleControl position="bottom-right" />
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
