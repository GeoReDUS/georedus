import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Flex, useRefByKey } from '@orioro/react-ui-core'
import { Map, MapInstance, MapMouseEvent } from 'react-map-gl/maplibre'
import styled from 'styled-components'
import { GhostCursor } from './GhostCursor'
import { mapSetFeaturesState } from '../useHover'
import { MapGeoJSONFeature } from 'maplibre-gl'
// import { mergeRefs } from 'react-merge-refs'

type HoverInfo = {
  index: number
  point: [number, number]
  coordinates: [number, number]
  event: MapMouseEvent
  features?: MapGeoJSONFeature[]
}

function parseHoverInfo(index: number, event: MapMouseEvent): HoverInfo {
  return {
    index,
    point: [event.point.x, event.point.y],
    coordinates: [event.lngLat.lng, event.lngLat.lat],
    event,
    features: event.features,
  }
}

const SingleMapContainer = styled.div``

export function makeSyncedMaps({
  components,
}: {
  components: {
    Map: typeof Map
  }
}) {
  type MapProps = Parameters<typeof components.Map>[0] & {
    tooltip?: boolean
  }

  type SyncedMapsProps = Omit<MapProps, 'tooltip'> & {
    tooltip?: (hoverInfo: HoverInfo, map: MapInstance) => React.ReactNode
    maps: MapProps[]
  }

  const MapComponent = components.Map

  return forwardRef(function SyncedMaps(
    {
      maps,
      style,
      initialViewState,
      children,
      tooltip: getTooltip,
      ...baseMapProps
    }: SyncedMapsProps,
    ref,
  ) {
    const [mapInstanceRefs, setMapInstanceRef] = useRefByKey<MapInstance>()

    const containerRef = useRef(null)
    const [viewState, setViewState] = useState(initialViewState)

    const syncedOnMove = useCallback(
      (evt) => {
        setViewState(evt.viewState)
        if (typeof baseMapProps.onMove === 'function') {
          baseMapProps.onMove(evt)
        }
      },
      [baseMapProps.onMove],
    )

    const [isDragging, setIsDragging] = useState(false)
    const syncedOnDragEnd = useCallback(
      (e) => {
        setIsDragging(false)

        if (typeof baseMapProps.onDragEnd === 'function') {
          baseMapProps.onDragEnd(e)
        }
      },
      [setIsDragging, baseMapProps.onDragEnd],
    )

    const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null)
    const [tooltips, setTooltips] = useState<React.ReactNode[] | null>(null)
    const syncedOnDragStart = useCallback(
      (e) => {
        setIsDragging(true)
        setTooltips(null)

        if (typeof baseMapProps.onDragStart === 'function') {
          baseMapProps.onDragStart(e)
        }
      },
      [baseMapProps.onDragStart],
    )

    const syncedOnMouseMove = useCallback(
      (event: MapMouseEvent, index: number) => {
        const nextHoverInfo = parseHoverInfo(index, event)

        setHoverInfo((prevHoverInfo) => {
          mapSetFeaturesState(event.target, prevHoverInfo?.features, {
            hover: false,
          })

          mapSetFeaturesState(event.target, nextHoverInfo?.features, {
            hover: true,
          })

          return nextHoverInfo
        })

        setTooltips(
          typeof getTooltip === 'function'
            ? maps.map(({ tooltip = true }, index) => {
                if (!tooltip) {
                  return null
                }

                return (
                  getTooltip(
                    nextHoverInfo,
                    mapInstanceRefs[index] as MapInstance,
                  ) || null
                )
              })
            : null,
        )

        if (typeof baseMapProps.onMouseMove === 'function') {
          //
          // Allow onMouseMove to be composed with base
          //
          baseMapProps.onMouseMove(event)
        }
      },
      [maps, baseMapProps.onMouseMove],
    )

    //
    // There is no notion of mouseenter/mouseleave
    // in maplibre.gl.
    //
    // Use onMouseOut instead
    //
    // https://github.com/mapbox/mapbox-gl-js/issues/10594
    // https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/MapEventType/#mouseout
    //
    const syncedOnMouseOut = useCallback(
      (event) => {
        setHoverInfo(null)
        setTooltips(null)

        if (Array.isArray(hoverInfo?.features)) {
          mapSetFeaturesState(event.target, hoverInfo.features, {
            hover: false,
          })
        }

        if (typeof baseMapProps.onMouseOut === 'function') {
          baseMapProps.onMouseOut(event)
        }
      },
      [setHoverInfo, setTooltips, hoverInfo, baseMapProps.onMouseOut],
    )

    //
    // Expose map instances
    //
    useImperativeHandle(
      ref,
      () => ({
        mapInstances: mapInstanceRefs,
      }),
      [mapInstanceRefs],
    )

    // Let's review, this might have performance impact
    const cursor = useMemo(
      () =>
        isDragging
          ? 'grabbing'
          : (hoverInfo?.features?.length || 0) > 0
            ? hoverInfo.features.some(
                (feat) => typeof feat.layer?.onClick === 'function',
              )
              ? 'pointer'
              : 'default'
            : 'default',
      [isDragging, hoverInfo],
    )

    return (
      <Flex
        ref={containerRef}
        direction="row"
        style={{
          position: 'relative',
          ...(style || {}),
        }}
      >
        {maps.map((mapProps, index) => {
          return (
            <SingleMapContainer
              key={mapProps.id || index}
              style={{
                position: 'absolute',
                top: 0,
                height: '100%',
                left: `calc(${index} * (100% / ${maps.length}))`,
                width: `calc(100% / ${maps.length})`,
              }}
            >
              {!isDragging && hoverInfo && hoverInfo.index !== index ? (
                <GhostCursor
                  style={{
                    position: 'absolute',
                    left: hoverInfo.point[0],
                    top: hoverInfo.point[1],
                    zIndex: 2,
                  }}
                />
              ) : null}
              {Array.isArray(tooltips) && tooltips[index]}
              <MapComponent
                ref={setMapInstanceRef(index)}
                // cursor={isDragging ? 'grabbing' : 'default'}
                // Let's review, this might have performance impact
                cursor={cursor}
                {...baseMapProps}
                {...mapProps}
                //
                // If only 1 map is being rendered,
                // do not use controlled state. Instead, let
                // it be uncontrolled for performance gains.
                //
                // Specifically, when using controlled state and
                // 3D terrain rendering there are glitches on
                // drag-end event.
                //
                {...(maps.length > 1 ? viewState || {} : {})}
                style={{
                  ...(mapProps.style || {}),
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
                onMove={syncedOnMove}
                onDragStart={syncedOnDragStart}
                onDragEnd={syncedOnDragEnd}
                onMouseMove={(event) => syncedOnMouseMove(event, index)}
                //
                // There is no notion of mouseenter/mouseleave
                // in maplibre.gl.
                //
                // Use onMouseOut instead
                //
                // https://github.com/mapbox/mapbox-gl-js/issues/10594
                // https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/MapEventType/#mouseout
                //
                onMouseOut={syncedOnMouseOut}
              />
            </SingleMapContainer>
          )
        })}
        {children}
      </Flex>
    )
  })
}

export const SyncedMaps = makeSyncedMaps({
  components: {
    Map,
  },
})
