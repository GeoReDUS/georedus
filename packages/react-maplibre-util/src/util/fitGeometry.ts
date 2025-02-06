import { bbox } from '@turf/turf'
import { MapInstance } from 'react-map-gl/dist/esm/types'

const DEFAULT_OPTIONS = {
  padding: {
    top: 60,
    bottom: 60,
    left: 60,
    right: 60,
  },
}

export function fitGeometry(
  map: MapInstance,
  geo: GeoJSON.GeoJSON,
  options: Parameters<MapInstance['fitBounds']>[1] = DEFAULT_OPTIONS,
) {
  const bounds = bbox(geo)

  return map.fitBounds(
    [
      [bounds[0], bounds[1]],
      [bounds[2], bounds[3]],
    ],
    {
      ...DEFAULT_OPTIONS,
      ...options,
    },
  )
}
