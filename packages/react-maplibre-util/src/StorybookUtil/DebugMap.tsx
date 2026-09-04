import React from 'react'
import { Map, MapProps, SourceProps } from 'react-map-gl/maplibre'
import { HoverTooltip } from '../HoverTooltip'
import { useHover } from '../useHover'
import { DebugPanel } from './DebugPanel'

export const DEBUG_MAP_PROPS: MapProps = {
  initialViewState: {
    longitude: -54.5,
    latitude: -15.5,
    zoom: 3.5,
    pitch: 0,
    bearing: 0,
  },
  style: {
    height: '100vh',
    width: '100vw',
  },
  mapStyle: `https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.STORYBOOK_MAP_TILER_API_KEY}`,
}

export function DebugMap({
  children,
  panel = 'bottom-right',
  ...props
}: MapProps) {
  //
  // Hover stuff
  //
  const [{ children: hoverChildren, ...hoverProps }, hoverInfo, isDragging] =
    useHover(
      {
        tooltip: ({ point, features }) => {
          if (!features) {
            return null
          }

          const tooltipDataSections = features
            .flatMap((feature) => {
              return {
                title:
                  feature.properties?.name ||
                  feature.properties?.label ||
                  feature.id,
                entries: [
                  ...Object.entries(feature.properties || {}),
                  ...Object.entries(feature.state || {}).map(([key, value]) => [
                    `${key} (state)`,
                    value,
                  ]),
                ].map(([key, value]) => [key, value + '']),
              }
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
    <Map {...DEBUG_MAP_PROPS} {...hoverProps} {...props}>
      {hoverChildren}
      {panel && (
        <DebugPanel
          data={
            Array.isArray(hoverInfo?.features) && hoverInfo?.features.length > 0
              ? {
                  // features: hoverInfo.features.map((feat) => ({
                  //   id: feat.id,
                  //   source: feat.source,
                  //   layer: feat.layer.id,
                  //   geometry: `geometry(${feat.geometry.type})`,
                  //   state: feat.state,
                  // })),
                  point: hoverInfo.point,
                  coordinates: hoverInfo.coordinates,
                }
              : null
          }
        />
      )}
      {children}
    </Map>
  )
}

export function sourceGeoJsonBr({
  id = 'geojson_br',
  intrarregiao = 'municipio',
  ...props
}: {
  id?: string
  intrarregiao?: 'municipio' | 'uf' | 'regiao' | null
  [key: string]: any
} = {}): SourceProps {
  return {
    id,
    promoteId: 'codarea',
    type: 'geojson',
    data: `https://servicodados.ibge.gov.br/api/v4/malhas/paises/BR?formato=application/vnd.geo+json&qualidade=minima&${intrarregiao ? `intrarregiao=${intrarregiao}` : ''}`,
    ...props,
  }
}
