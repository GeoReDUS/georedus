import { type MapInstance } from 'react-map-gl/maplibre'

export type SyncMapsOptions = {
  centerOffsetPixels: {
    x: number
    y: number
  }
}

export function syncMaps(
  mainMap: MapInstance,
  targetMap: MapInstance,
  { centerOffsetPixels }: SyncMapsOptions,
) {
  const center = mainMap.getCenter()
  const zoom = mainMap.getZoom()
  const bearing = mainMap.getBearing()
  const pitch = mainMap.getPitch()

  if (!centerOffsetPixels || !mainMap || !targetMap) {
    console.warn(
      'could not sync maps, missing centerOffsetPixels || mainMap || targetMap',
    )
    return
  }

  // Convert the center to a pixel point
  const centerPoint = mainMap.project(center)

  // Apply the offset
  const offsetPoint = {
    x: centerPoint.x + centerOffsetPixels.x,
    y: centerPoint.y + centerOffsetPixels.y,
  }

  // Convert the offset pixel back to a lngLat
  const newCenter = mainMap.unproject(offsetPoint)

  // Move the mini-map to the new center
  targetMap.jumpTo({ center: newCenter, zoom, bearing, pitch })
}
