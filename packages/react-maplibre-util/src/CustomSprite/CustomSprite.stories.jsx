import React from 'react'
import Map, { Layer, Source } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'

import { CustomSprite } from './CustomSprite'

export default {
  title: 'CustomSprite',
  parameters: {
    layout: 'fullscreen',
  },
}

export const Basic = () => {
  return (
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
      <CustomSprite url="/map-assets/sprite" />

      <Source
        type="geojson"
        data={{
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [-66.0333332, 0.7999968],
              },
            },
          ],
        }}
      >
        <Layer
          type="circle"
          paint={{
            'circle-radius': 20,
            'circle-color': 'red',
          }}
        />
        <Layer
          type="symbol"
          layout={{
            'icon-image': 'mdi_forest',
            'icon-size': 0.8,
          }}
        />
      </Source>
    </Map>
  )
}
