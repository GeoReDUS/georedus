import { useEffect } from 'react'
import { SyncMapsOptions, syncMaps } from './syncMaps'
import { type MapInstance } from 'react-map-gl/maplibre'

export function useSyncedMaps(
  mainMapRef: MapInstance,
  otherMapRef: MapInstance,
  options: SyncMapsOptions,
  deps: any[],
) {
  useEffect(() => {
    const mainMap = mainMapRef.current?.getMap()
    const otherMap = otherMapRef.current?.getMap()

    if (!mainMap || !otherMap) {
      return
    }

    const _syncMainToOther = () => {
      syncMaps(mainMap, otherMap, options)
    }
    mainMap.on('move', _syncMainToOther)
    _syncMainToOther()

    // const _syncOtherToMain = () => {
    //   syncMaps(otherMap, mainMap, options)
    // }
    // otherMap.on('move', _syncOtherToMain)


    return () => {
      mainMap.off('move', _syncMainToOther)
      // otherMap.off('move', _syncOtherToMain)
    }
  }, [...deps, options])
}
