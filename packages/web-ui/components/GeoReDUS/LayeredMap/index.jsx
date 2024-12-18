import React, { useMemo, useState } from 'react'
import DeckGL from '@deck.gl/react'
import { MapView } from '@deck.gl/core'
import { Map } from 'react-map-gl/maplibre'
import { DataLayer } from './DataLayer'
import { useDataLayers } from './useDataLayers'
import { GeoJsonLayer } from '@deck.gl/layers'
import { scaleQuantile, scaleSequential } from 'd3-scale'
import { extent } from 'd3-array'
import { interpolateYlOrRd, schemeYlOrRd } from 'd3-scale-chromatic'
import { pick } from 'lodash'
// Function to convert a hex color to RGB
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${r}, ${g}, ${b})`
}

export function LayeredMap({ layers, ...props }) {
  const dataLayers = useDataLayers({
    layers,
  })

  return (
    <DeckGL
      {...props}
      controller
      layers={dataLayers
        .filter((dataQuery) => dataQuery.status === 'success')
        .map((dataQuery) => {
          const { layer, features } = dataQuery.data

          // const colorScale = scaleQuantile()
          //   .domain(
          //     features.map((feature) => feature.properties[layer.property]),
          //   )
          //   .range(schemeYlOrRd[9].map((hex) => hexToRgb(hex))) // Assumes you are using a D3 color scheme that has 9 colors.

          const colorScale = scaleSequential(
            extent(features, (feature) => feature.properties[layer.property]),
            interpolateYlOrRd,
          )

          return new GeoJsonLayer({
            //
            // https://github.com/visgl/deck.gl/issues/4176
            // IDs cannot be repeated
            //
            id: layer.id + '' + Date.now(),
            data: features.map((feat) => ({
              ...feat,
              properties: pick(feat.properties, [layer.property]),
            })),
            getLineColor: (feature) => {
              const rgbStr = colorScale(feature.properties[layer.property])

              if (!rgbStr) {
                return [0, 0, 0, 255]
              }

              const rgb = rgbStr.match(/\d+/g).map(Number) // Extract RGB components as numbers

              return [rgb[0], rgb[1], rgb[2], 255]
            },
            getFillColor: (feature) => {
              const rgbStr = colorScale(feature.properties[layer.property])

              if (!rgbStr) {
                return [0, 0, 0, 255]
              }

              const rgb = rgbStr.match(/\d+/g).map(Number) // Extract RGB components as numbers

              return [rgb[0], rgb[1], rgb[2], (2 / 3) * 255]
            },
          })
        })}
    >
      {/*  {layers.map((layer, index) => (
        <DataLayer key={layer.id || index} layer={layer} />
      ))}*/}

      <MapView controller>
        <Map
          mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.NEXT_PUBLIC_MAP_TILER_API_KEY}`}
        />
      </MapView>
    </DeckGL>
  )
}
