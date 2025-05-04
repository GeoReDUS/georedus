import React from 'react'
import Map from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Theme } from '@radix-ui/themes'

import '@radix-ui/themes/styles.css'

import { InspectControl } from './index'

export default {
  title: 'InspectControl',
  parameters: {
    layout: 'fullscreen',
  },
}

export const Basic = () => {
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
          style={{ width: '100vw', height: '100vh' }}
          mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.STORYBOOK_MAP_TILER_API_KEY}`}
          attributionControl={false}
        >
          <InspectControl position="top-right" />
        </Map>
      </div>
    </Theme>
  )
}
