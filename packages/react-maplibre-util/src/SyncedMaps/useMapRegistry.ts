import type { Map } from 'maplibre-gl'
import { useCallback, useState } from 'react'
import type { MapEvent } from 'react-map-gl/maplibre'

export function useMapRegistry() {
  const [maps, setMaps] = useState<Map[]>([])

  const onLoad = useCallback(
    (evt: MapEvent) =>
      //
      // Set maps in next tick, so that does not interfere
      // in map element rendering
      //
      setTimeout(() => setMaps((currMaps) => [...currMaps, evt.target]), 0),
    [],
  )

  const onRemove = useCallback(
    (evt: MapEvent) =>
      setMaps((currMaps) => currMaps.filter((map) => map !== evt.target)),
    [],
  )

  return {
    maps,
    onLoad,
    onRemove,
  }
}
