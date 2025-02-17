import { MapCore } from '@/components/Map'
import { useRef } from 'react'
import { Source, Layer, useMap } from 'react-map-gl/maplibre'

export function UsingMapLibre() {
  const id = 'test'

  const mapRef = useRef()

  const handleClick = (event) => {
    const map = mapRef.current.getMap()
    const features = map.queryRenderedFeatures(event.point, {
      layers: ['test'], // Specify the layer to query
    })
    console.log(features) // Access the data from MVT
  }

  const LAYER_ID = 'cem_censo_2010'
  // const LAYER_ID = 'ibge_br_uf'

  return (
    <MapCore
      onClick={handleClick}
      ref={mapRef}
      initialViewState={{
        longitude: -46.6388,
        latitude: -23.5489,
        zoom: 11,
        // minZoom: 8,
        // maxZoom: 14,
      }}
      style={{
        width: '100vw',
        height: '100vh',
      }}
    >
      <Source
        id={id}
        type="vector"
        tiles={[
          `http://localhost:6002/${LAYER_ID}/{z}/{x}/{y}`
        ]}
        minzoom={10}
        maxzoom={20}
        // url="http://localhost:3000/function_zxy_query"
        // url="http://localhost:3000/function_zxy_query?properties_idx_string_4=3550308"
        // url="http://localhost:3000/datasus_ibge_br_regiao_de_saude"
        // url={`http://localhost:3000/${LAYER_ID}`}
        // url="http://localhost:3000/InitiativeMapLayerFeature"
      >
        <Layer
          id={id}
          source={id}
          source-layer={LAYER_ID}
          type="fill"
          paint={{
            'fill-color': '#ff0000',
            'fill-opacity': 0.5,
            'fill-outline-color': '#000000',
            // 'line-color': 'steelblue',
            // 'line-width': 3,
            // 'line-opacity': 1
          }}
          maxzoom={8}
        />
        <Layer
          source={id}
          source-layer={LAYER_ID}
          type="line"
          paint={{
            'line-color': '#000000', // Line color
            'line-width': 1, // Line width
            // 'line-dasharray': [2, 4], // Dash pattern
          }}
        />
      </Source>
    </MapCore>
  )
}
