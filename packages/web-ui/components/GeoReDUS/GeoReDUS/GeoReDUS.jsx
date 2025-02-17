import {
  Flex,
  Input,
  entriesByIdInitialState,
  entriesByIdReducer,
} from '@orioro/react-ui-core'
import { ViewMenu } from '../ViewMenu'
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import { LayeredMap, fitGeometry } from '@orioro/react-maplibre-util'
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
import { resolveViewSpecs } from '../viewSpecs'

const GOOGLE_SHEETS_VIEW_SPECS =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7R3I_EjXhXkNK5OE4qUG_uiSg9qZrPIzzVPtj0fNA4EympIWzQA4KkFt6TNwp6RYH7ZgaJrDJ4z6J/pub?gid=2016686120&single=true&output=csv'

const LayeredMapWithHover = withHover(LayeredMap, {
  tooltip: ({ point, features }) => {
    const tooltipDataSections = features
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
        <HoverTooltip position={point} dataSections={tooltipDataSections} />
      )
    )
  },
})

export function GeoReDUS() {
  const [viewConfState, viewConfDispatch] = useReducer(
    entriesByIdReducer,
    null,
    entriesByIdInitialState,
  )

  const mainMapRef = useRef(null)

  const [municipioId, setMunicipioId] = useState('1501402')

  const [viewState, setViewState] = useState({
    latitude: -1.455833,
    longitude: -48.503887,
    zoom: 10,
  })
  // const onMove = useCallback((evt) => setViewState(evt.viewState), [])

  const [viewSpecsInput] = useState(GOOGLE_SHEETS_VIEW_SPECS)
  const viewSpecsQuery = useQuery({
    queryKey: ['ViewSpecs', viewSpecsInput],
    queryFn: async () => resolveViewSpecs(viewSpecsInput),
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
    queries: viewConfState.orderedIds.map((viewId) => {
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
    // () =>
    //   viewsQueries
    //     .filter((query) => query.status === 'success')
    //     .map((query) => query.data),
    () =>
      viewsQueries
        // .filter((query) => query.status === 'success')
        .map((query) => query.data)
        .filter(Boolean),
    [viewsQueries],
  )

  console.log(resolvedViews)
  console.log(viewsQueries)

  const flyToMunicipio = useCallback(async () => {
    if (!mainMapRef.current || !municipioId) {
      return
    }

    const [mun] = await fetch(
      `${METADATA_API_ENDPOINT}/ibge_malha_br_municipio?select=bbox&id=eq.${municipioId}`,
    ).then((res) => res.json())

    if (mun && mun.bbox) {
      fitGeometry(mainMapRef.current, mun.bbox)
    }
  }, [municipioId])

  console.log('hello')

  //
  // Fly to
  //
  useEffect(() => {
    flyToMunicipio()
  }, [municipioId])

  return (
    <Flex>
      {viewSpecsQuery.status === 'success' && (
        <ViewMenu
          viewSpecs={viewSpecsQuery.data}
          viewConfById={viewConfState.byId}
          onActivateView={(viewId, initialConf) =>
            viewConfDispatch({
              type: 'ADD_ENTRY',
              payload: {
                ...initialConf,
                id: viewId,
              },
            })
          }
          onDeactivateView={(viewId) => {
            viewConfDispatch({
              type: 'DELETE_ENTRY',
              payload: viewId,
            })
          }}
          onUpdateViewConf={(viewId, nextViewConf) =>
            viewConfDispatch({
              type: 'UPDATE_ENTRY',
              payload: {
                ...nextViewConf,
                id: viewId,
              },
            })
          }
          style={{
            width: 400,
            position: 'fixed',
            zIndex: 2,
            top: 0,
            left: 0,
            bottom: 0,
          }}
        />
      )}

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
      <LayeredMapWithHover
        onLoad={() => {
          console.log('laoeded')
          flyToMunicipio()
        }}
        setPrefetchZoomDelta={0}
        views={resolvedViews}
        ref={mainMapRef}
        initialViewState={viewState}
        // onMove={onMove}
        style={{ width: '100vw', height: '100vh' }}
        mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.NEXT_PUBLIC_MAP_TILER_API_KEY}`}
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
            {resolvedViews
              .flatMap((view) => view?.legends || [])
              .map((legend) => (
                <Legend key={legend.id} {...legend} />
              ))}
          </Flex>
        </div>
      </LayeredMapWithHover>
    </Flex>
  )
}
