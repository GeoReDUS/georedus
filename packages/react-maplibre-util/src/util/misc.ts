import type { LayerSpecification, Map, SourceSpecification } from 'maplibre-gl'

export function ensureAddLayer(
  map: Map,
  layerId: string,
  layer: LayerSpecification,
) {
  if (!map.getLayer(layerId)) {
    map.addLayer({
      ...layer,
      id: layerId,
    })
  }
}

export function ensureRemoveLayer(map: Map, layerId: string) {
  if (map.getLayer(layerId)) {
    map.removeLayer(layerId)
  }
}

export function ensureAddSource(
  map: Map,
  sourceId: string,
  sourceSpec: SourceSpecification,
) {
  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, sourceSpec)
  }
}

export function ensureRemoveSource(map: Map, sourceId: string) {
  if (map.getSource(sourceId)) {
    map.removeSource(sourceId)
  }
}
