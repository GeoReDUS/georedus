import React, { forwardRef, useMemo, useRef } from 'react'
import { Map, Layer, Source, MapInstance } from 'react-map-gl/maplibre'
import { LayeredMapProps } from '../types'
import {
  MapViewsParseResult,
  getSrcLayer,
  getSrcViewByLayerId,
  parseMapViews,
} from './parseMapViews'
import { mergeRefs } from 'react-merge-refs'

//
// Augment mouse events with info from original view
//
const VIEW_AUGMENTED_EVENT_HANDLERS = [
  'onMouseDown',
  'onMouseUp',
  'onMouseOver',
  'onMouseEnter',
  'onMouseMove',
  'onMouseLeave',
  'onMouseOut',
  'onClick',
  'onDblClick',
  'onContextMenu',
]

function useViewAugmentedEventHandlers(
  props: LayeredMapProps,
  parsedMapViews: MapViewsParseResult,
): Partial<LayeredMapProps> {
  function augmentFeature(feature) {
    //
    // Augment the feature with the mapView property
    //
    const mapView = getSrcViewByLayerId(parsedMapViews, feature.layer.id)

    const layer = getSrcLayer(parsedMapViews, feature.layer.id)

    return {
      ...feature,
      layer,
      mapView,
    }
  }

  const handlers = Object.fromEntries(
    VIEW_AUGMENTED_EVENT_HANDLERS.map((handlerName) =>
      typeof props[handlerName] === 'function'
        ? [
            handlerName,
            (evt) =>
              props[handlerName]({
                ...evt,
                features: evt.features?.map((feat) => augmentFeature(feat)),
              }),
          ]
        : null,
    ).filter(Boolean) as unknown as [string, () => any][],
  )

  return handlers
}

export const LayeredMap = forwardRef<MapInstance, LayeredMapProps>(
  function LayeredMapInner(
    {
      views,
      interactiveLayerIds: interactiveLayerIdsInput = [],
      children,
      hover,
      ...mapProps
    }: LayeredMapProps,
    externalRef,
  ) {
    const mapRef = useRef<MapInstance>(null)

    //
    // Parse sources, layers and interactiveLayerIds from
    // views spec
    //
    const parsed = useMemo(
      () =>
        views
          ? parseMapViews(views, {
              existingLayers: mapRef.current
                ? mapRef.current.getStyle()?.layers || null
                : null,
            })
          : {
              srcMapViews: [],
              sources: [],
              layers: [],
              interactiveLayerIds: [],
            },
      [views, mapRef.current],
    )

    const evtHandlers = useViewAugmentedEventHandlers(mapProps, parsed)

    return (
      <Map
        ref={mergeRefs([mapRef, externalRef].filter(Boolean))}
        interactiveLayerIds={[
          ...interactiveLayerIdsInput,
          ...parsed.interactiveLayerIds,
        ]}
        {...mapProps}
        {...evtHandlers}
      >
        {children}
        {parsed.sources.map(({ id, ...source }) => (
          <Source key={id} id={id} {...source} />
        ))}
        {parsed.layers.map(({ id, ...layer }) => (
          <Layer key={id} id={id} {...layer} />
        ))}
      </Map>
    )
  },
)
