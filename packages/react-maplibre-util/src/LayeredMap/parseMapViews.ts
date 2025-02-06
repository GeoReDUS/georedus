import { AnyLayer } from 'react-map-gl/dist/esm/exports-maplibre'
import { MapView, MapViewLayer, MapViewSource } from '../types'
import { uniq, uniqBy } from 'lodash-es'

type ParsedSource = MapViewSource & {
  id: string
}

type ParsedLayer = MapViewLayer & {
  id: string
}

type ParseMapViewsReturn = {
  sources: ParsedSource[]
  layers: ParsedLayer[]
  interactiveLayerIds: string[]
}

type ParseMapViewsOptions = {
  existingLayers?: AnyLayer[]
}

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
      .map((layer, index) => ({
        ...layer,
        //
        // Allow for zIndex overriding
        // In case no zIndex is set, respect the order in which
        // layers were provided.
        //
        // Layers that come after are rendered on top of previous layers
        //
        zIndex: typeof layer.zIndex === 'number' ? layer.zIndex : index,
      }))
      //
      // Order layers in ascending zIndex order, so that
      // layers with higher zIndex are rendered later and on top of
      // previous ones
      //
      .sort((layerA, layerB) => (layerA.zIndex >= layerB.zIndex ? 1 : -1))
      .map((layer, index, sortedLayers) => {
        if (index === sortedLayers.length - 1) {
          // is last layer
          return layer
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

export function parseMapViews(
  orderedViews: MapView[],
  { existingLayers }: ParseMapViewsOptions = {},
): ParseMapViewsReturn {
  const parsed = orderedViews.reduce(
    (acc, { id: viewId, sources, layers }) => {
      const _sources = Object.entries(sources).reduce(
        (acc, [sourceRelativeId, source]) => [
          ...acc,
          {
            ...source,
            id: source.absoluteId
              ? source.absoluteId
              : `${viewId}__${sourceRelativeId}`,
          },
        ],
        [] as ParsedSource[],
      )

      const { _layers, interactiveLayerIds } = Object.entries(layers).reduce(
        (acc, [layerRelativeId, layer]) => {
          const layerId = layer.absoluteId ? layer.absoluteId : `${viewId}__${layerRelativeId}`

          return {
            interactiveLayerIds: layer.interactive
              ? [...acc.interactiveLayerIds, layerId]
              : acc.interactiveLayerIds,
            _layers: [
              ...acc._layers,
              {
                ...layer,
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
    } as ParseMapViewsReturn,
  )

  return {
    sources: uniqBy(parsed.sources, 'id'),
    layers: sortLayers(uniqBy(parsed.layers, 'id'), { existingLayers }),
    interactiveLayerIds: uniq(parsed.interactiveLayerIds),
  }
}
