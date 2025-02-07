import { Flex, Input } from '@orioro/react-ui-core'
import { LayerMenu } from '../LayerMenu'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LayeredMap, fitGeometry } from '@orioro/react-maplibre-util'
import { Legend } from '@orioro/react-chart-util'
import 'maplibre-gl/dist/maplibre-gl.css'

import { VIEW_SPECS_BY_ID } from '../viewSpecs'

import {
  METADATA_API_ENDPOINT,
  VECTOR_TILE_SERVER_ENDPOINT,
} from '../viewSpecs/constants'
import { useQueries } from '@tanstack/react-query'
import { resolve, resolveView } from '../resolveView/resolveView'
import { useHover } from '@orioro/react-maplibre-util'
import { HoverTooltip } from '@orioro/react-maplibre-util'
import {
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
} from 'react-map-gl/maplibre'

export function GeoReDUS() {
  const mainMapRef = useRef(null)
  const [activeTabId, setActiveTabId] = useState('populacao-e-domicilios')
  const [activeLayers, setActiveLayers] = useState([])

  const [municipioId, setMunicipioId] = useState('1501402')

  const [viewState, setViewState] = useState({
    latitude: -1.455833,
    longitude: -48.503887,
    zoom: 10,
  })
  const onMove = useCallback((evt) => setViewState(evt.viewState), [])

  const activeViewIds = useMemo(
    () => activeLayers.map((layer) => `cem_censo_2010.${layer.id}_pct`),
    [activeLayers],
  )

  // const activeViewIds = ['cem_educacao_escolas_2022.ideb_fund_ai']

  // const [activeViewIds, setActiveViewIds] = useState(
  //   Object.keys(VIEW_SPECS_BY_ID),
  // )

  const viewsQueries = useQueries({
    queries: activeViewIds.map((viewId) => ({
      queryKey: ['ResolveView', viewId, municipioId],
      queryFn: async () => {
        return resolveView(viewId, {
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

  //
  // Fly to
  //
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
    <Flex>
      <LayerMenu
        activeTabId={activeTabId}
        onSetActiveTabId={setActiveTabId}
        activeLayers={activeLayers}
        onSetActiveLayers={setActiveLayers}
        style={{
          width: 400,
          position: 'fixed',
          zIndex: 2,
          top: 10,
          left: 10,
          bottom: 10,
        }}
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
            options: async () => {
              const municipios = await fetch(
                'https://servicodados.ibge.gov.br/api/v1/localidades/municipios?view=nivelado',
              ).then((response) => response.json())

              return municipios.map((mun) => ({
                label: `${mun['municipio-nome']} (${mun['UF-sigla']})`,
                value: mun['municipio-id'] + '',
              }))
            },
          }}
          value={municipioId}
          onSetValue={setMunicipioId}
        />
      </Flex>
      <LayeredMap
        views={resolvedViews}
        ref={mainMapRef}
        {...viewState}
        onMove={onMove}
        style={{ width: '100vw', height: '100vh' }}
        mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.NEXT_PUBLIC_MAP_TILER_API_KEY}`}
        {...hoverProps}
        cursor={
          isDragging
            ? 'grabbing'
            : hoverInfo?.features?.length > 0
              ? 'default'
              : 'grab'
        }
        // mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.STORYBOOK_MAP_TILER_API_KEY}`}
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
    </Flex>
  )
}
