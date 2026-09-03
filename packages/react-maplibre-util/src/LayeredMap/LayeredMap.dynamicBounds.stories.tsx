import React, { useMemo, useState } from 'react'
import { LayeredMap } from './LayeredMap'

export default {
  title: 'LayeredMap / Dynamic Bounds',
  parameters: {
    layout: 'fullscreen',
  },
}

const BOUND_PRESETS = {
  westernEurope: {
    label: 'Western Europe',
    bounds: [-10, 36, 15, 55] as [number, number, number, number],
    center: { latitude: 46, longitude: 2.5, zoom: 4.5 },
  },
  easternEurope: {
    label: 'Eastern Europe',
    bounds: [15, 40, 40, 58] as [number, number, number, number],
    center: { latitude: 49, longitude: 27, zoom: 4.5 },
  },
}

export const Basic = () => {
  const [selectedPreset, setSelectedPreset] = useState('westernEurope')

  const views = useMemo(
    () => [
      {
        id: 'test',
        sources: {
          demo: {
            type: 'vector',
            url: 'https://demotiles.maplibre.org/tiles/tiles.json',
            bounds: BOUND_PRESETS[selectedPreset].bounds,
          },
        },
        layers: {
          demo: {
            interactive: true,
            type: 'line',
            source: 'demo',
            'source-layer': 'countries',
            paint: {
              'line-color': 'green',
              'line-opacity': 1,
            },
          },
        },
      },
    ],
    [selectedPreset],
  )

  return (
    <>
      <div
        style={{
          fontFamily: 'sans-serif',
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 10,
          background: 'white',
          padding: 12,
          borderRadius: 8,
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          width: 320,
        }}
      >
        <div>
          {Object.entries(BOUND_PRESETS).map(([presetKey, presetData]) => (
            <label
              style={{ display: 'flex', alignItems: 'center' }}
              key={presetKey}
            >
              <input
                style={{
                  margin: '0 4px 0 0',
                }}
                name="bound_preset"
                type="radio"
                value={presetKey}
                checked={presetKey === selectedPreset}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedPreset(presetKey)
                  }
                }}
              />
              <span>{presetData.label}</span>
            </label>
          ))}
        </div>
        <pre>{JSON.stringify(BOUND_PRESETS[selectedPreset], null, 2)}</pre>
        <div style={{ fontSize: 13, color: '#555', marginTop: 8 }}>
          MapLibre has no way to update a source's <code>bounds</code> once
          created, so <code>react-map-gl</code> can't either. Switching presets
          works here because <code>LayeredMap</code> detects the change and
          remounts the source — notice the tiles fully reload instead of
          panning.
        </div>
      </div>
      <LayeredMap
        initialViewState={BOUND_PRESETS[selectedPreset].center}
        style={{
          height: '100vh',
          width: '100vw',
        }}
        mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.STORYBOOK_MAP_TILER_API_KEY}`}
        views={views}
      />
    </>
  )
}
