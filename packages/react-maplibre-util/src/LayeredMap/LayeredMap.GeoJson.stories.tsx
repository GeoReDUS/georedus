import React from 'react'
import { LayeredMap } from './LayeredMap'
import 'maplibre-gl/dist/maplibre-gl.css'

export default {
  title: 'LayeredMap / GeoJson',
  parameters: {
    layout: 'fullscreen',
  },
}

export const Basic = () => {
  return (
    <LayeredMap
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
      ]}
    />
  )
}
