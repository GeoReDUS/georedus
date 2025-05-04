import React from 'react'
import { Marker } from 'react-map-gl/maplibre'

export function ResultMarker({ result, ...props }) {
  const location =
    result &&
    (result.center ||
      (result.geometry?.type === 'Point' && result.geometry.coordinates))
  if (location) {
    return <Marker {...props} longitude={location[0]} latitude={location[1]} />
  } else {
    return null
  }
}
