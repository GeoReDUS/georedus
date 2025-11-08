import { isEqual } from 'lodash-es'
import type { Map } from 'maplibre-gl'

export type ParseLayerOrderOpts = {
  map: Map
  layerIds: string[]
}

//
// Retrive a list of current ordered layer ids
// within a given set of layer ids
//
export function parseLayerOrder({ map, layerIds }: ParseLayerOrderOpts) {
  return map.getLayersOrder().filter((layerId) => layerIds.includes(layerId))
}

export type SyncLayerOrderOpts = {
  expectedLayerOrderId: string[]
  map: Map
  topAnchorLayerId?: string
}

/**
 * Sync MapLibre layer order to match `expectedLayerOrderId`.
 *
 * - Only layers present in `expectedLayerOrderId` are moved.
 * - Missing layers are ignored (no-op for those entries).
 * - If `topAnchorLayerId` is provided, the last expected layer is positioned
 *   just beneath that anchor; otherwise it becomes the topmost layer.
 *
 * This helps counteract dynamic reordering issues when using react-map-gl.
 * See: https://github.com/visgl/react-map-gl/issues/939#issuecomment-1515395161
 */
export function syncLayerOrder({
  expectedLayerOrderId,
  map,
  topAnchorLayerId = undefined,
}: SyncLayerOrderOpts) {
  const currentLayerOrderId = parseLayerOrder({
    map,
    layerIds: expectedLayerOrderId,
  })

  if (isEqual(expectedLayerOrderId, currentLayerOrderId)) {
    return
  }

  expectedLayerOrderId.forEach((layerId, index) => {
    if (!map.getLayer(layerId)) {
      return
    }

    if (index === expectedLayerOrderId.length - 1) {
      // Place the last expected layer just beneath the top anchor (if any),
      // otherwise move it to the absolute top.
      map.moveLayer(layerId, topAnchorLayerId)
    } else {
      const beneathLayerId = expectedLayerOrderId[index + 1]

      if (!map.getLayer(beneathLayerId)) {
        return
      }

      map.moveLayer(layerId, beneathLayerId)
    }
  })
}
