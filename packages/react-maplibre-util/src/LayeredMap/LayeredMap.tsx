import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  createContext,
  useContext,
  useEffect,
} from 'react'
import { Map, Layer, Source, MapInstance } from 'react-map-gl/maplibre'
import { LayeredMapProps } from '../types'
import {
  MapViewsParseResult,
  augmentFeature,
  getSrcLayer,
  getSrcViewByLayerId,
  parseMapViews,
} from './parseMapViews'
import { syncLayerOrder } from './syncLayerOrder'
import { getLayerRemountKey, getSourceRemountKey } from '../util'

//
// Augment mouse events with info from original view
//
const VIEW_AUGMENTED_EVENT_HANDLERS = [
  'onMouseDown',
  'onMouseUp',
  'onMouseOver',
  //
  // There is no notion of mouseenter/mouseleave
  // in maplibre.gl
  //
  // https://github.com/mapbox/mapbox-gl-js/issues/10594
  // https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/MapEventType/#mouseout
  //
  // 'onMouseEnter',
  // 'onMouseLeave',
  'onMouseMove',
  'onMouseOut',
  'onClick',
  'onDblClick',
  'onContextMenu',
]

const LayeredMapContext = createContext(null)

export function useLayeredMap() {
  return useContext(LayeredMapContext)
}

function useViewAugmentedEventHandlers(
  props: LayeredMapProps,
  parsedMapViews: MapViewsParseResult,
): Partial<LayeredMapProps> {
  const handlers = Object.fromEntries(
    VIEW_AUGMENTED_EVENT_HANDLERS.map((handlerName) =>
      typeof props[handlerName] === 'function'
        ? [
            handlerName,
            (evt) =>
              props[handlerName]({
                ...evt,
                features: evt.features?.map((feat) =>
                  augmentFeature(parsedMapViews, feat),
                ),
              }),
          ]
        : null,
    ).filter(Boolean) as unknown as [string, () => any][],
  )

  return handlers
}

export const LayeredMap = forwardRef<
  {
    map: MapInstance
    augmentFeature: (
      feature: Parameters<typeof augmentFeature>[1],
    ) => ReturnType<typeof augmentFeature>
    getSrcViewByLayerId: (
      layerId: string,
    ) => ReturnType<typeof getSrcViewByLayerId>
    getSrcLayer: (layerId: string) => ReturnType<typeof getSrcLayer>
  },
  LayeredMapProps
>(function LayeredMapInner(
  {
    views,
    interactiveLayerIds: interactiveLayerIdsInput = [],
    children,
    ...mapProps
  }: LayeredMapProps,
  layeredMapRef,
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

  const imperativeHandle = useMemo(
    () => ({
      map: mapRef.current as MapInstance,
      augmentFeature: augmentFeature.bind(null, parsed),
      getSrcViewByLayerId: getSrcViewByLayerId.bind(null, parsed),
      getSrcLayer: getSrcLayer.bind(null, parsed),
    }),
    [mapRef.current, parsed],
  )

  useImperativeHandle(layeredMapRef, () => imperativeHandle, [imperativeHandle])

  //
  // Force sync layer order
  // https://github.com/visgl/react-map-gl/issues/939#issuecomment-1515395161
  //
  useEffect(() => {
    if (!parsed?.layers || !mapRef.current) {
      return
    }

    // Timeout ensures layers are added to map before moving
    const timeoutId = setTimeout(() => {
      const expectedLayerOrderId = parsed.layers.map((layer) => layer.id)

      syncLayerOrder({
        expectedLayerOrderId,
        map: mapRef.current,
      })
    }, 0)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [parsed?.layers])

  return (
    <Map
      ref={mapRef}
      interactiveLayerIds={[
        ...interactiveLayerIdsInput,
        ...parsed.interactiveLayerIds,
      ]}
      {...mapProps}
      {...evtHandlers}
    >
      <LayeredMapContext.Provider value={imperativeHandle}>
        {children}
        {parsed.sources.map(({ id, viewId, ...source }) => (
          <Source
            //
            // Use `getSourceRemountKey` to ensure that
            // non-reactive props (props that react-map-gl as no
            // way of updating on maplibre) force re-mount
            // of component
            //
            key={getSourceRemountKey(id, source)}
            id={id}
            {...source}
          />
        ))}
        {parsed.layers.map(({ id, ...layer }) => (
          <Layer
            //
            // Use `getLayerRemountKey` to ensure that
            // non-reactive props (props that react-map-gl as no
            // way of updating on maplibre) force re-mount
            // of component
            //
            key={getLayerRemountKey(id, layer)}
            id={id}
            {...layer}
          />
        ))}
      </LayeredMapContext.Provider>
    </Map>
  )
})
