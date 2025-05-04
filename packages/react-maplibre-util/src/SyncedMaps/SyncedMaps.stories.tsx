import React, { useMemo } from 'react'
import { makeSyncedMaps } from './SyncedMaps'
import { LayeredMap } from '../LayeredMap'
import 'maplibre-gl/dist/maplibre-gl.css'
import { HoverTooltip } from '../HoverTooltip'
import { ControlContainer } from '../Controls'

export default {
  title: 'SyncedMaps',
  parameters: {
    layout: 'fullscreen',
  },
}

const SyncedMaps = makeSyncedMaps({
  components: {
    Map: LayeredMap,
  },
})

function layeredMapTooltip(hoverInfo, layeredMap) {
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
    // console.log(interactiveFeatures)
    return (
      <HoverTooltip
        style={{
          maxWidth: 200,
        }}
        position={hoverInfo.point}
        dataSections={[
          {
            title: hoverInfo.coordinates.join('|'),
            entries: Object.entries(interactiveFeatures[0].properties),
          },
        ]}
      />
    )
  } else {
    return null
  }
}

export const Basic = () => {
  return (
    <SyncedMaps
      style={{
        width: '100vw',
        height: '100vh',
        fontFamily: 'sans-serif',
      }}
      initialViewState={{
        latitude: -1.455833,
        longitude: -48.503887,
        zoom: 10,
      }}
      mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.STORYBOOK_MAP_TILER_API_KEY}`}
      tooltip={layeredMapTooltip}
      maps={useMemo(
        () => [
          {
            id: 'left',
            views: [
              {
                id: 'test',
                sources: {
                  municipios: {
                    type: 'geojson',
                    promoteId: 'codarea',
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
                      // 'fill-opacity': 0.6,
                      'fill-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        1,
                        0.3,
                      ],
                    },
                  },
                  municipios_bounds: {
                    type: 'line',
                    source: 'municipios',
                    paint: {
                      'line-color': 'red',
                      'line-opacity': 1,
                      'line-width': 2,
                    },
                  },
                },
              },
            ],
            children: (
              <ControlContainer.Unstyled position="bottom-right">
                <div
                  style={{
                    width: 200,
                    height: 300,
                    background: 'white',
                  }}
                >
                  Some legend placeholder
                </div>
              </ControlContainer.Unstyled>
            ),
          },
          {
            id: 'right',
            views: [
              {
                id: 'test',
                sources: {
                  municipios: {
                    type: 'geojson',
                    data: `https://servicodados.ibge.gov.br/api/v4/malhas/municipios/1501402?formato=application/vnd.geo+json`,
                  },
                },
                layers: {
                  municipios: {
                    type: 'fill',
                    source: 'municipios',
                    paint: {
                      'fill-color': 'red',
                      'fill-opacity': 0.6,
                    },
                  },
                },
              },
            ],
            children: (
              <ControlContainer.Unstyled position="bottom-right">
                <div
                  style={{
                    width: 200,
                    height: 300,
                    background: 'white',
                  }}
                >
                  Some legend placeholder
                </div>
              </ControlContainer.Unstyled>
            ),
          },
          // {
          //   id: 'other',
          // },
        ],
        [],
      )}
    />
  )
}
