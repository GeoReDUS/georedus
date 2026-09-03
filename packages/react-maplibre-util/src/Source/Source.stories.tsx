import React, { useState } from 'react'
import { Layer } from 'react-map-gl/maplibre'
import { Source } from './Source'
import { DebugMap, sourceGeoJsonBr } from '../StorybookUtil'

export default {
  title: 'Source',
  parameters: {
    layout: 'fullscreen',
  },
}
export const Basic = () => {
  const [featureState, setFeatureState] = useState({
    stateById: {
      '1501402': {
        test: 'hello',
      },
    },
  })

  return (
    <DebugMap
      interactiveLayerIds={['geojson_br_fill']}
      onMouseMove={(e) => {
        const feature = e.features && e.features[0]
        if (feature) {
          setFeatureState((curr) => {
            const featState = curr?.stateById?.[feature.id]

            return {
              ...curr,
              stateById: {
                ...curr.stateById,
                [feature.id]: {
                  ...featState,
                  hovered: true,
                },
              },
            }
          })
        }
      }}
    >
      <Source {...sourceGeoJsonBr()} featureState={featureState} />
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
          'line-color': [
            'case',
            ['boolean', ['feature-state', 'hovered'], false],
            '#0000FF', // color when hovered
            ['boolean', ['feature-state', 'hover'], false],
            '#ff0000', // color when hovered
            'transparent', // default color
          ],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hovered'], false],
            4, // color when hovered
            ['boolean', ['feature-state', 'hover'], false],
            2, // color when hovered
            1, // default color
          ],
          'line-opacity': 0.7,
        }}
      />
    </DebugMap>
  )
}
