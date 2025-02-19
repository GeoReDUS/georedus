import { MapMouseEvent } from 'maplibre-gl'
import React, { useCallback, useState } from 'react'

type DefaultHoverInfo = {
  point: [number, number] // [x, y]
  coordinates: [number, number] // [lng, lat]
  features: GeoJSON.Feature[]
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

export function useHover<InfoT = any>(
  props: UseHoverProps = DEFAULT_PROPS,
  deps: any[],
) {
  props = {
    ...DEFAULT_PROPS,
    ...props,
  }

  const [isDragging, setIsDragging] = useState(false)
  const onDragStart = useCallback(() => setIsDragging(true), [setIsDragging])
  const onDragEnd = useCallback(() => setIsDragging(false), [setIsDragging])

  const [tooltip, setTooltip] = useState(null)
  const [hoverInfo, setHoverInfo] = useState<InfoT | null>(null)
  const onMouseMove = useCallback(
    (event: MapMouseEvent) => {
      const nextHoverInfo = props.parseEvent(event)
      setHoverInfo(nextHoverInfo)
      setTooltip(props.tooltip ? props.tooltip(nextHoverInfo) : null)
    },
    [...deps, props.tooltip],
  )

  return [
    {
      onMouseMove,
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
