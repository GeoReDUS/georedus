import React from 'react'
import DeckGL from '@deck.gl/react'
import { MVTLayer } from '@deck.gl/geo-layers'
import type { MVTLayerPickingInfo } from '@deck.gl/geo-layers'
import type { Feature, Geometry } from 'geojson'
import { MapView } from '@deck.gl/core'
import { Map } from 'react-map-gl/maplibre'

type PropertiesType = {
  name?: string
  rank: number
  layerName: string
  class: string
}

export function MVTSandbox() {
  const layer = new MVTLayer<PropertiesType>({
    id: 'MVTLayer',
    data: [
      // 'https://tiles-a.basemaps.cartocdn.com/vectortiles/carto.streets/v1/{z}/{x}/{y}.mvt',
      'http://localhost:3000/InitiativeMapLayerFeature/{z}/{x}/{y}',
    ],
    minZoom: 0,
    maxZoom: 14,
    getFillColor: [240, 240, 240, (2 / 3) * 255],
    getLineWidth: 10,
    // getFillColor: (f: Feature<Geometry, PropertiesType>) => {
    //   return [240, 240, 240, (2 / 3) * 255]

    //   // switch (f.properties.layerName) {
    //   //   case 'poi':
    //   //     return [255, 0, 0]
    //   //   case 'water':
    //   //     return [120, 150, 180]
    //   //   case 'building':
    //   //     return [218, 218, 218]
    //   //   default:
    //   //     return [240, 240, 240]
    //   // }
    // },
    // getLineWidth: (f: Feature<Geometry, PropertiesType>) => {
    //   return 10

    //   // switch (f.properties.class) {
    //   //   case 'street':
    //   //     return 6
    //   //   case 'motorway':
    //   //     return 10
    //   //   default:
    //   //     return 1
    //   // }
    // },
    getLineColor: [100, 100, 100],
    getPointRadius: 2,
    pointRadiusUnits: 'pixels',
    stroked: true,
    // picking: true,
  })

  return (
    <div
      style={{
        background: 'white',
      }}
    >
      <DeckGL
        initialViewState={{
          longitude: -46.6388,
          latitude: -23.5489,
          zoom: 11,
        }}
        controller
        getTooltip={({ object }: MVTLayerPickingInfo<PropertiesType>) =>
          object && (object.properties.name || object.properties.layerName)
        }
        layers={[layer]}
      >
        <MapView controller>
          <Map
            mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.NEXT_PUBLIC_MAP_TILER_API_KEY}`}
          />
        </MapView>
      </DeckGL>
    </div>
  )
}
