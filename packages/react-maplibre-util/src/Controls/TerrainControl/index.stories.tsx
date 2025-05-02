import React, { useState } from 'react'
import Map, { AttributionControl } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Theme } from '@radix-ui/themes'

import '@radix-ui/themes/styles.css'

import { TerrainControl } from './index'
import { ControlContainer } from '../ControlContainer'
import { Debug } from '@orioro/react-ui-core'

export default {
  title: 'TerrainControl',
  parameters: {
    layout: 'fullscreen',
  },
}

export const Basic = () => {
  const [terrain, setTerrain] = useState({
    // enable3d: true,
    contours: true,
  })

  const [viewState, setViewState] = useState(null)

  return (
    <Theme>
      <div
        style={{
          position: 'relative',
        }}
      >
        <Map
          initialViewState={{
            latitude: 0.7999968,
            longitude: -66.0333332,
            zoom: 10,
          }}
          onMove={(e) => setViewState(e.viewState)}
          style={{ width: '100vw', height: '100vh' }}
          mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.STORYBOOK_MAP_TILER_API_KEY}`}
          attributionControl={false}
        >
          <TerrainControl
            position="top-right"
            value={terrain}
            onSetValue={setTerrain}
          />
          <ControlContainer
            style={{ boxShadow: 'none', pointerEvents: 'none' }}
          >
            <Debug data={{ terrain, viewState }} />
          </ControlContainer>

          <AttributionControl />
        </Map>
      </div>
    </Theme>
  )
}
