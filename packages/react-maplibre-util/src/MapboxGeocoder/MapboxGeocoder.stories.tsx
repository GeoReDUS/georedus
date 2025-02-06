import React, { useState } from 'react'
import Map from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css'

import { MapboxGeocoder } from './MapboxGeocoder'

export default {
  title: 'MapboxGeocoder',
  parameters: {
    layout: 'fullscreen',
  },
}

export const Basic = () => {
  const [value, setValue] = useState(null)

  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      <Map
        initialViewState={{
          latitude: -1.455833,
          longitude: -48.503887,
          zoom: 10,
        }}
        style={{ width: '100vw', height: '100vh' }}
        mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.STORYBOOK_MAP_TILER_API_KEY}`}
      >
        <MapboxGeocoder />
      </Map>

      <code
        style={{
          maxHeight: '100px',
          overflow: 'auto',
          position: 'absolute',
          bottom: 10,
          left: 10,
          whiteSpace: 'pre',
          background: 'white',
        }}
      >
        {value ? JSON.stringify(value, null, 2) : 'null'}
      </code>
    </div>
  )
}
