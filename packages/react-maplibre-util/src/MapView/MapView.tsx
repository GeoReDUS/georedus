import React from 'react'
import {
  Source,
  type AnyLayer,
  type AnySource,
  Layer,
} from '@vis.gl/react-maplibre'

type Source = AnySource & {
  id: string
}

type MapViewProps = {
  sources: Source[]
  layers: AnyLayer[]
}

export function MapView({ sources, layers }: MapViewProps) {
  return (
    <>
      {sources.map((source, index) => (
        <Source {...source} key={index} />
      ))}
      {layers.map((layer, index) => (
        <Layer {...layer} key={index} />
      ))}
    </>
  )
}
