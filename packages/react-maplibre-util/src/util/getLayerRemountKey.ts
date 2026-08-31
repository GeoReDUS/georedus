/**
 * Derives a React `key` for a <Layer> that changes whenever a
 * non-reactive prop changes, forcing a remount instead of a silently
 * dropped update.
 *
 * react-map-gl only pushes `paint`, `layout`, `filter`,
 * `minzoom`/`maxzoom`, and `beforeId` to the map after mount (via
 * real setters like `setPaintProperty`). `type`, `source`, and
 * `source-layer` have no such setters — changing them is a no-op
 * unless the layer is removed and re-added, i.e. remounted.
 *
 *   <Layer key={getLayerRemountKey(id, layer)} id={id} {...layer} />
 *
 * https://github.com/visgl/react-map-gl/blob/4b649aaf926adacb3ffba4b7c5d8edebaca90f8a/modules/react-maplibre/src/components/layer.ts#L20
 */
export function getLayerRemountKey(
  id: string,
  layer: Record<string, unknown>,
): string {
  return `${id}:${layer.type}:${layer.source}:${layer['source-layer'] ?? ''}`
}
