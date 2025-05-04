import React, { useState } from 'react'
import Map from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Theme } from '@radix-ui/themes'
import { Debug } from '@orioro/react-ui-core'
import { ControlContainer } from '../Controls/ControlContainer'

import '@radix-ui/themes/styles.css'

import { MapboxGeocoderControl } from './index'

export default {
  title: 'MapboxGeocoderControl',
  parameters: {
    layout: 'fullscreen',
  },
}

export const Basic = () => {
  const [value, setValue] = useState(null)

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
          <MapboxGeocoderControl
            accessToken={process.env.STORYBOOK_MAPBOX_ACCESS_TOKEN}
            position="top-right"
            marker
            onResult={(e) => {
              setValue(e.result)
            }}
          />
          <ControlContainer.Unstyled>
            <div
              style={{
                maxHeight: 400,
                overflow: 'auto',
              }}
            >
              <Debug data={{ value }} />
            </div>
          </ControlContainer.Unstyled>
        </Map>
      </div>
    </Theme>
  )
}
