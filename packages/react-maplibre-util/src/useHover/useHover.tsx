import { Map, MapGeoJSONFeature, MapMouseEvent } from 'maplibre-gl'
import React, { useCallback, useState } from 'react'

type DefaultHoverInfo = {
  point: [number, number] // [x, y]
  coordinates: [number, number] // [lng, lat]
  features: MapGeoJSONFeature[]
}

export function hoverParseEvent(event: MapMouseEvent): DefaultHoverInfo {
  return {
    point: [event.point.x, event.point.y],
    coordinates: [event.lngLat.lng, event.lngLat.lat],
    features: event.features,
  }
}

export type UseHoverProps<DataT = DefaultHoverInfo> = {
  parseEvent?: (event: MapMouseEvent) => DataT
  tooltip?: (data: DataT) => React.ReactNode
}

const DEFAULT_PROPS = {
  parseEvent: hoverParseEvent,
}

export function mapSetFeaturesState(
  map: Map,
  features: MapGeoJSONFeature[] | undefined,
  state: any,
) {
  if (!Array.isArray(features)) {
    return
  }

  features.forEach((feat) => {
    if (feat.id) {
      map.setFeatureState(
        { source: feat.source, sourceLayer: feat.sourceLayer, id: feat.id },
        state,
      )
    } else {
      console.warn(`could not get feature id`, feat)
    }
  })
}

export function useHover<InfoT = any>(
  props: UseHoverProps = DEFAULT_PROPS,
  deps: any[],
) {
  props = {
    ...DEFAULT_PROPS,
    ...props,
  }

  const [isDragging, setIsDragging] = useState(false)
  const onDragStart = useCallback(() => {
    setTooltip(null)
    setIsDragging(true)
  }, [])
  const onDragEnd = useCallback(() => setIsDragging(false), [setIsDragging])

  const [tooltip, setTooltip] = useState(null)
  const [hoverInfo, setHoverInfo] = useState<InfoT | null>(null)

  const onMouseMove = useCallback(
    (event: MapMouseEvent) => {
      const nextHoverInfo = props.parseEvent(event)
      setTooltip(props.tooltip ? props.tooltip(nextHoverInfo) : null)

      const map = event.target

      setHoverInfo((prevHoverInfo) => {
        if (Array.isArray(prevHoverInfo?.features)) {
          mapSetFeaturesState(map, prevHoverInfo.features, { hover: false })
        }
        if (Array.isArray(nextHoverInfo?.features)) {
          mapSetFeaturesState(map, nextHoverInfo.features, { hover: true })
        }

        return nextHoverInfo
      })
    },
    [...deps, props.tooltip],
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
  const onMouseOut = useCallback(
    (event) => {
      setHoverInfo(null)
      setTooltip(null)

      if (Array.isArray(hoverInfo?.features)) {
        mapSetFeaturesState(event.target, hoverInfo.features, { hover: false })
      }
    },
    [setHoverInfo, setTooltip, hoverInfo],
  )

  return [
    {
      onMouseMove,
      onMouseOut,
      onDragStart,
      onDragEnd,
      cursor: isDragging
        ? 'grabbing'
        : hoverInfo?.features?.length > 0
          ? 'default'
          : 'grab',
      children: isDragging ? null : <>{tooltip}</>,
    },
    hoverInfo,
    isDragging,
  ]
}
