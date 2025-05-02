import React, { useCallback, useMemo, useState } from 'react'
import { LayeredMap } from './LayeredMap'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useHover } from '../useHover'
import { HoverTooltip } from '../HoverTooltip'
import { LayeredMapProps } from '../types'
import { TerrainControl } from '../Controls'
import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'

export default {
  title: 'LayeredMap',
  parameters: {
    layout: 'fullscreen',
  },
}

export const Basic = () => {
  const [viewState, setViewState] = useState<
    Omit<LayeredMapProps, 'views' | 'onMove'>
  >({
    latitude: -1.455833,
    longitude: -48.503887,
    zoom: 10,
  })

  const onMove = useCallback((evt) => setViewState(evt.viewState), [])

  //
  // Hover stuff
  //
  const [{ children: hoverChildren, ...hoverProps }, hoverInfo, isDragging] =
    useHover(
      {
        tooltip: ({ point, features }) => {
          const tooltipDataSections = features
            .flatMap((feature) => {
              return {
                entries: [['feature', JSON.stringify(feature.properties)]],
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
    <LayeredMap
      {...hoverProps}
      {...viewState}
      onMove={onMove}
      style={{
        height: '100vh',
        width: '100vw',
      }}
      initialViewState={{
        latitude: -1.455833,
        longitude: -48.503887,
        zoom: 10,
      }}
      mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.STORYBOOK_MAP_TILER_API_KEY}`}
      views={[
        {
          id: 'test',
          sources: {
            municipios: {
              type: 'geojson',
              data: `https://servicodados.ibge.gov.br/api/v4/malhas/municipios/1501402?formato=application/vnd.geo+json`,
            },
            paises: {
              type: 'geojson',
              data: `https://servicodados.ibge.gov.br/api/v4/malhas/paises/BR?formato=application/vnd.geo+json`,
            },
          },
          layers: {
            paises: {
              interactive: true,
              type: 'fill',
              source: 'paises',
              paint: {
                'fill-color': 'green',
                'fill-opacity': 0.6,
              },
            },
            municipios: {
              interactive: true,
              type: 'fill',
              source: 'municipios',
              paint: {
                'fill-color': 'red',
                'fill-opacity': 0.6,
              },
            },
          },
        },
      ]}
    >
      {hoverChildren}
      <div
        style={{
          position: 'absolute',
          top: 10,
        }}
      >
        Teste
      </div>
    </LayeredMap>
  )
}

export const Basic3d = () => {
  //
  // Hover stuff
  //
  const [{ children: hoverChildren, ...hoverProps }, hoverInfo, isDragging] =
    useHover(
      {
        tooltip: ({ point, features }) => {
          const tooltipDataSections = features
            .flatMap((feature) => {
              return {
                entries: [['feature', JSON.stringify(feature.properties)]],
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
    <Theme>
      <LayeredMap
        //
        // Controlled viewState has some rendering
        // issue when using terrain.
        //
        // Map skips/jumps on drag release
        //
        // {...viewState}
        // onMove={onMove}
        initialViewState={{
          latitude: -23.01,
          longitude: -44.3184,
          zoom: 10,
        }}
        mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.STORYBOOK_MAP_TILER_API_KEY}`}
        style={{
          height: '100vh',
          width: '100vw',
        }}
        {...hoverProps}
        views={[
          {
            id: 'test',
            sources: {
              municipios: {
                promoteId: 'codarea',
                type: 'geojson',
                data: `https://servicodados.ibge.gov.br/api/v4/malhas/paises/BR?intrarregiao=municipio&formato=application/vnd.geo+json&qualidade=minima`,
              },
            },
            layers: {
              municipios_fill: {
                interactive: true,
                type: 'fill',
                source: 'municipios',
                paint: {
                  'fill-color': 'red',
                  'fill-opacity': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    1,
                    0.5,
                  ],
                },
              },
              municipios_boundaries: {
                type: 'line',
                source: 'municipios',
                paint: {
                  'line-color': 'black',
                  'line-width': 3,
                },
              },
            },
          },
        ]}
      >
        <TerrainControl value={useMemo(() => ({ enable3d: true }), [])} />
        {hoverChildren}
        <div
          style={{
            position: 'absolute',
            top: 10,
          }}
        >
          Teste
        </div>
      </LayeredMap>
    </Theme>
  )
}
