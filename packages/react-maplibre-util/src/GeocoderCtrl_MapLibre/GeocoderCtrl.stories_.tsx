import React, { useEffect, useState } from 'react'
import Map from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css'
import { mapboxGeocoderApi } from './mapboxGeocoderApi'

import { GeocoderCtrl } from './GeocoderCtrl'

export default {
  title: 'GeocoderCtrl - reference',
  parameters: {
    layout: 'fullscreen',
  },
}

const api = mapboxGeocoderApi({
  accessToken: process.env.STORYBOOK_MAPBOX_ACCESS_TOKEN,
})

api.getSuggestions({ query: 'sao paulo' }).then((res) => {
  console.log(res)
})

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
        <GeocoderCtrl
        api={api}
          // query="São Paulo"
          marker={{ color: 'red' }}
          // types={['country', 'region', 'place']}
          onResult={(e) => {
            setValue(e.result)
          }}
          onResults={e => {
            console.log('onResults', e)
          }}
          onClear={() => setValue(null)}
        />
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
