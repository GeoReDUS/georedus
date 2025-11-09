import type { Map } from 'maplibre-gl'
import { useEffect, useState } from 'react'

export function useTilesLoading(maps: Map | Map[]) {
  maps = Array.isArray(maps) ? maps : [maps]
  const [loading, setLoading] = useState(false)

  const checkLoading = () => {
    const loading = maps.some((map) => !map.areTilesLoaded())
    setLoading(loading)
  }

  useEffect(() => {
    const handlers = maps.map((map) => {
      const update = () => checkLoading()
      map.on('dataloading', update)
      // map.on('data', update)
      map.on('idle', update)
      return () => {
        map.off('dataloading', update)
        // map.off('data', update)
        map.off('idle', update)
      }
    })

    checkLoading() // initial

    return () => handlers.forEach((off) => off())
  }, [maps])

  return loading
}
