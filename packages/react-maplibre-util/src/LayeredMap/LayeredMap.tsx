import React, { forwardRef, useMemo, useRef } from 'react'
import { Map, Layer, Source, MapInstance } from 'react-map-gl/maplibre'
import { LayeredMapProps } from '../types'
import { parseMapViews } from './parseMapViews'
import { mergeRefs } from 'react-merge-refs'

export const LayeredMap = forwardRef<MapInstance, LayeredMapProps>(
  function LayeredMapInner(
    {
      views,
      interactiveLayerIds: interactiveLayerIdsInput = [],
      children,
      ...mapProps
    }: LayeredMapProps,
    externalRef,
  ) {
    const mapRef = useRef<MapInstance>(null)

    const { sources, layers, interactiveLayerIds } = useMemo(
      () =>
        views
          ? parseMapViews(views, {
              existingLayers: mapRef.current
                ? mapRef.current.getStyle().layers
                : null,
            })
          : {
              sources: [],
              layers: [],
              interactiveLayerIds: [],
            },
      [views, mapRef.current],
    )

    return (
      <Map
        ref={mergeRefs([mapRef, externalRef].filter(Boolean))}
        interactiveLayerIds={[
          ...interactiveLayerIdsInput,
          ...interactiveLayerIds,
        ]}
        {...mapProps}
      >
        {children}
        {sources.map(({ id, ...source }) => (
          <Source key={id} id={id} {...source} />
        ))}
        {layers.map(({ id, ...layer }) => (
          <Layer key={id} id={id} {...layer} />
        ))}
      </Map>
    )
  },
)
