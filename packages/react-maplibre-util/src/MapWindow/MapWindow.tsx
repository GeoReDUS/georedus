import React, { createRef, forwardRef, useCallback, useState } from 'react'
import { Map, useMap } from 'react-map-gl/maplibre'
import { useSyncedMaps } from './useSyncedMaps'
import { getCenterOffsetPixels } from './util'
import { mergeRefs } from 'react-merge-refs'

export const MapWindow = forwardRef(function MapWindowInner(
  { onLoad: externalOnLoad, ...mapProps }: Parameters<typeof Map>[0],
  externalRef,
) {
  const mapRef = createRef(null)
  const mergedRef = mergeRefs([externalRef, mapRef])
  const [centerOffsetPixels, setCenterOffsetPixels] = useState(null)

  const [mapReady, setMapReady] = useState(false)

  const parentMapRef = useMap()

  console.log('parentMapRef', parentMapRef)

  useSyncedMaps(
    parentMapRef,
    mapRef,
    {
      centerOffsetPixels,
    },
    [centerOffsetPixels, mapReady],
  )

  const _onLoad = useCallback(
    (e) => {
      const parentMap = parentMapRef.current?.getMap()
      const parentEl = parentMapRef.current?.getContainer?.()
      const selfMap = e.target
      const selfEl = e.target?.getContainer?.()

      //
      // TODO: probably we need to check for parentMap load event as well.
      //

      if (!parentMap || !selfMap || !parentEl || !selfEl) {
        console.log('MISSING', {
          parentMap,
          selfMap,
          parentEl,
          selfEl,
        })

        return
      }

      setCenterOffsetPixels(getCenterOffsetPixels(parentEl, selfEl))
      setMapReady(true)

      if (typeof externalOnLoad === 'function') {
        externalOnLoad(e)
      }
    },
    [setCenterOffsetPixels, setMapReady],
  )

  return (
    <Map
      attributionControl={false}
      {...mapProps}
      onLoad={_onLoad}
      ref={mergedRef}
    />
  )
})
