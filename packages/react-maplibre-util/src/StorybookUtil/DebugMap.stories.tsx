import React from 'react'
import Map, { Layer, Source } from 'react-map-gl/maplibre'
import { HoverTooltip } from '../HoverTooltip'
import { pick } from 'lodash-es'
import { DebugMap, sourceGeoJsonBr, DEBUG_MAP_PROPS } from './DebugMap'

export default {
  title: 'StorybookUtil / DebugMap',
  parameters: {
    layout: 'fullscreen',
  },
}

export const Basic = () => {
  return (
    <DebugMap interactiveLayerIds={['geojson_br_fill']}>
      <Source {...sourceGeoJsonBr()} />
      <Layer
        id="geojson_br_fill"
        source="geojson_br"
        type="fill"
        paint={{
          'fill-color': 'skyblue',
          'fill-opacity': 0.7,
        }}
      />
      <Layer
        id="geojson_br_line"
        source="geojson_br"
        type="line"
        paint={{
          'line-color': 'red',
          'line-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1,
            0,
          ],
        }}
      />
    </DebugMap>
  )
}
