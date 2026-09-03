import React from 'react'
import Map, { Layer, Source } from 'react-map-gl/maplibre'
import { useHover } from './useHover'
import { HoverTooltip } from '../HoverTooltip'
import { pick } from 'lodash-es'
import {
  DebugPanel,
  DebugMap,
  sourceGeoJsonBr,
  DEBUG_MAP_PROPS,
} from '../StorybookUtil'

export default {
  title: 'useHover',
  parameters: {
    layout: 'fullscreen',
  },
}

export const Basic = () => {
  //
  // Hover stuff
  //
  const [{ children: hoverChildren, ...hoverProps }, hoverInfo, isDragging] =
    useHover(
      {
        tooltip: ({ point, features }) => {
          if (!features) {
            return null
          }

          const tooltipDataSections = features
            .flatMap((feature) => {
              return {
                entries: [
                  ...Object.entries(feature.properties || {}),
                  ...Object.entries(feature.state || {}),
                ].map(([key, value]) => [key, value + '']),
              }
            })
            .filter(Boolean)

          return (
            tooltipDataSections.length > 0 && (
              <HoverTooltip
                position={point}
                dataSections={tooltipDataSections}
              />
            )
          )
        },
      },
      [],
    )

  return (
    <Map
      {...DEBUG_MAP_PROPS}
      {...hoverProps}
      interactiveLayerIds={['geojson_br_fill']}
    >
      {hoverChildren}
      <DebugPanel
        data={
          hoverInfo
            ? {
                point: hoverInfo.point,
                coordinates: hoverInfo.coordinates,
                features: hoverInfo.features.map((feat) => ({
                  ...pick(feat, ['id', 'source']),
                  layer: feat.layer.id,
                  geometry: `geometry(${feat.geometry.type})`,
                  state: feat.state,
                })),
              }
            : null
        }
      />
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
    </Map>
  )
}
