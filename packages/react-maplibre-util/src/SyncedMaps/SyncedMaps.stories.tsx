import React, { useMemo, useRef, useState } from 'react'
import { makeSyncedMaps } from './SyncedMaps'
import { LayeredMap } from '../LayeredMap'
import 'maplibre-gl/dist/maplibre-gl.css'
import { HoverTooltip } from '../HoverTooltip'
import { ControlContainer } from '../Controls'
import { useMapRegistry } from './useMapRegistry'
import { useTilesLoading } from './useTilesLoading'
import { SliderInput } from '@orioro/react-ui-core'
import { Theme } from '@radix-ui/themes'

export default {
  title: 'SyncedMaps',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: (Story) => (
    <Theme>
      <Story />
    </Theme>
  ),
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
  const ref = useRef(null)

  const registry = useMapRegistry()

  const tilesLoading = useTilesLoading(registry.maps)

  const [opacity, setOpacity] = useState(0.5)

  return (
    <>
      <div
        style={{
          padding: 30,
          background: 'white',
        }}
      >
        <div>Opacidade:</div>
        <SliderInput
          value={opacity}
          onSetValue={setOpacity}
          min={0.1}
          max={1}
          step={0.1}
        />
      </div>
      {tilesLoading && (
        <div
          style={{
            position: 'fixed',
            bottom: 30,
            right: 30,
            zIndex: 20,
            background: 'yellow',
            fontFamily: 'sans-serif',
            padding: 30,
          }}
        >
          Loading
        </div>
      )}
      <SyncedMaps
        ref={ref}
        style={{
          width: '100vw',
          height: '100vh',
          fontFamily: 'sans-serif',
        }}
        onLoad={(evt) => registry.onLoad(evt)}
        onRemove={(evt) => registry.onLoad(evt)}
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
                          opacity,
                        ],
                      },
                    },
                    municipios_bounds: {
                      type: 'line',
                      source: 'municipios',
                      paint: {
                        'line-color': 'red',
                        'line-opacity': opacity,
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
                        'fill-opacity': opacity,
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
          [opacity],
        )}
      />
    </>
  )
}
