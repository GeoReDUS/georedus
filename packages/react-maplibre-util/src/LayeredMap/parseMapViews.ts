import { AnyLayer } from 'react-map-gl/dist/esm/exports-maplibre'
import { MapView, MapViewLayer, MapViewSource } from '../types'
import { isPlainObject, uniq, uniqBy } from 'lodash-es'
import { MapMouseEvent } from 'maplibre-gl'

type ParsedSource = MapViewSource & {
  id: string
  viewId: string
}

type ParsedLayer = MapViewLayer & {
  id: string
  viewId: string
  onClick?: (feature: GeoJSON.Feature, event: MapMouseEvent) => any
}

export type MapViewsParseResult = {
  srcMapViews: MapView[]
  sources: ParsedSource[]
  layers: ParsedLayer[]
  interactiveLayerIds: string[]
}

type ParseMapViewsOptions = {
  existingLayers?: AnyLayer[]
}

function _validZIndex(zIndex: any) {
  return typeof zIndex === 'number' && !Number.isNaN(zIndex)
}

// Return 1 makes layerB come first in array order
// and layerA later, so it will be
// rendered on top of layerB
const LAYER_A_ON_TOP_OF_B = 1
const LAYER_B_ON_TOP_OF_A = -1

export function sortLayers(
  layers: MapViewLayer[],
  { existingLayers }: ParseMapViewsOptions,
): MapViewLayer[] {
  const existingLayersById = existingLayers
    ? Object.fromEntries(existingLayers.map((layer) => [layer.id, layer]))
    : {}

  //
  // Apply ordering to layers
  //
  // About layer ordering:
  // - Later in the list → Rendered on top (higher z-index).
  // - Earlier in the list → Rendered below.
  //
  return (
    layers
      //
      // PREVIOUS SORT:
      // .map((layer, index) => ({
      //   ...layer,
      //   //
      //   // Allow for zIndex overriding
      //   // In case no zIndex is set, respect the order in which
      //   // layers were provided.
      //   //
      //   // Layers that come after are rendered on top of previous layers
      //   //
      //   zIndex: typeof layer.zIndex === 'number' ? layer.zIndex : index,
      // }))
      // //
      // // Order layers in ascending zIndex order, so that
      // // layers with higher zIndex are rendered later and on top of
      // // previous ones
      // //
      // .sort((layerA, layerB) => (layerA.zIndex >= layerB.zIndex ? 1 : -1))

      .map((layer, index) => ({
        ...layer,
        //
        // Allow for zIndex overriding
        // In case no zIndex is set, respect the order in which
        // layers were provided.
        //
        // Layers that come after are rendered on top of previous layers
        //
        _inputOrderIndex: index,
        zIndex: typeof layer.zIndex === 'number' ? layer.zIndex : null,
      }))
      //
      // Order layers in ascending zIndex order, so that
      // layers with higher zIndex are rendered later and on top of
      // previous ones
      //
      // Layers without zIndex are always rendered beneath
      // those with zIndex
      //
      // Layers with the same zIndex are compared using _inputOrderIndex
      //
      .sort((layerA, layerB) => {
        const aValid = _validZIndex(layerA.zIndex)
        const bValid = _validZIndex(layerB.zIndex)
        const aZIndex = layerA.zIndex
        const bZIndex = layerB.zIndex

        if (aValid && !bValid) {
          return LAYER_A_ON_TOP_OF_B
        } else if (!aValid && bValid) {
          return LAYER_B_ON_TOP_OF_A
        } else if ((!aValid && !bValid) || aZIndex === bZIndex) {
          return layerA._inputOrderIndex >= layerB._inputOrderIndex
            ? LAYER_A_ON_TOP_OF_B
            : LAYER_B_ON_TOP_OF_A
        } else {
          return (aZIndex as number) > (bZIndex as number)
            ? LAYER_A_ON_TOP_OF_B
            : LAYER_B_ON_TOP_OF_A
        }
      })

      //
      // This was a strategy to use beforeId to
      // sync map order. We've faced some pitfalls:
      // - Some layers do not exist when multiple layers
      //   are created at once, thus maplibre fails to
      //   apply beforeId (and throws errors)
      // - There are issues related to layer dynamic ordering,
      //   see: https://github.com/visgl/react-map-gl/issues/939#issuecomment-1515395161
      // - We've opted for manually syncing layer orders when
      //   layers update
      //
      .map((layer, index, sortedLayers) => {
        if (index === sortedLayers.length - 1) {
          // is last layer
          return { ...layer, beforeId: null }
        } else {
          const beforeId = sortedLayers[index + 1].id
          //
          // If the layer this layer should be placed before exists,
          // set beforeId. Otherwise, ignore beforeId.
          //
          // This handles the scenario in which layers are being added
          // simultaneously
          //
          return existingLayersById[beforeId]
            ? {
                ...layer,
                beforeId,
              }
            : layer
        }
      })
  )
}

export function getSrcLayer(
  parsed: MapViewsParseResult,
  layerId: string,
): ParsedLayer | null {
  return parsed.layers.find((layer) => layer.id === layerId) || null
}

/**
 * Given a layerId, attempts to retrieve the source mapView
 *
 * @param  {MapViewsParseResult} parsed  [description]
 * @param  {string}              layerId [description]
 * @param  {[type]}                      [description]
 * @return {MapView}                     [description]
 */
export function getSrcViewByLayerId(
  parsed: MapViewsParseResult,
  layerId: string,
): MapView | null {
  const layer = getSrcLayer(parsed, layerId)

  return layer
    ? parsed.srcMapViews.find((view) => view.id === layer.viewId) || null
    : null
}

export function augmentFeature(
  parsed: MapViewsParseResult,
  feature: GeoJSON.Feature & {
    layer: {
      id: string
    }
  },
) {
  //
  // Augment the feature with the mapView property
  //
  const mapView = getSrcViewByLayerId(parsed, feature.layer.id)

  const layer = getSrcLayer(parsed, feature.layer.id)

  return {
    ...feature,
    layer,
    mapView,
  }
}

export function fmtLayerAbsoluteId(viewId: string, layerRelativeId: string) {
  return `${viewId}__${layerRelativeId}`
}

export function parseMapViews(
  orderedViews: MapView[],
  { existingLayers }: ParseMapViewsOptions = {},
): MapViewsParseResult {
  const parsed = orderedViews.reduce(
    (acc, { id: viewId, sources, layers }) => {
      const _sources = isPlainObject(sources)
        ? Object.entries(sources).reduce(
            (acc, [sourceRelativeId, source]) =>
              !source
                ? acc
                : [
                    ...acc,
                    {
                      ...source,
                      viewId,
                      id: source.absoluteId
                        ? source.absoluteId
                        : `${viewId}__${sourceRelativeId}`,
                    },
                  ],
            [] as ParsedSource[],
          )
        : []

      const { _layers, interactiveLayerIds } = isPlainObject(layers)
        ? Object.entries(layers).reduce(
            (acc, [layerRelativeId, layer]) => {
              if (!layer) {
                return acc
              }

              const layerId = layer.absoluteId
                ? layer.absoluteId
                : fmtLayerAbsoluteId(viewId, layerRelativeId)
              // : `${viewId}__${layerRelativeId}`

              return {
                interactiveLayerIds:
                  layer.interactive || typeof layer.onClick === 'function'
                    ? [...acc.interactiveLayerIds, layerId]
                    : acc.interactiveLayerIds,
                _layers: [
                  ...acc._layers,
                  {
                    ...layer,
                    viewId,
                    id: layerId,
                    source: layer.absoluteSourceId
                      ? layer.absoluteSourceId
                      : `${viewId}__${layer.source}`,
                  },
                ],
              }
            },
            {
              interactiveLayerIds: [],
              _layers: [],
            } as {
              interactiveLayerIds: string[]
              _layers: ParsedLayer[]
            },
          )
        : {
            _layers: [],
            interactiveLayerIds: [],
          }

      return {
        sources: [...acc.sources, ..._sources],
        layers: [...acc.layers, ..._layers],
        interactiveLayerIds: [
          ...acc.interactiveLayerIds,
          ...interactiveLayerIds,
        ],
      }
    },
    {
      sources: [],
      layers: [],
      interactiveLayerIds: [],
    } as Omit<MapViewsParseResult, 'srcMapViews'>,
  )

  return {
    srcMapViews: orderedViews,
    sources: uniqBy(parsed.sources, 'id'),
    layers: sortLayers(uniqBy(parsed.layers, 'id'), { existingLayers }),
    interactiveLayerIds: uniq(parsed.interactiveLayerIds),
  }
}
