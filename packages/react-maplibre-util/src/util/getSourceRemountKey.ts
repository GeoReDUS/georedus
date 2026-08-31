type SourceLike = Record<string, unknown> & { type?: string }

// Props react-map-gl's updateSource() cannot push to the underlying
// MapLibre/Mapbox source after creation, per source type.
// Keep this in sync with react-map-gl's source.ts — as it gains
// reactive support for more props (e.g. tiles/url did in 7.1.8),
// trim the corresponding entries here.
//
// See location of <Source /> component src code:
// https://github.com/visgl/react-map-gl/blob/4b649aaf926adacb3ffba4b7c5d8edebaca90f8a/modules/react-maplibre/src/components/source.ts#L79
//
const NON_REACTIVE_PROPS_BY_TYPE: Record<string, string[]> = {
  vector: [
    'bounds',
    'scheme',
    'minzoom',
    'maxzoom',
    'attribution',
    'promoteId',
    'volatile',
  ],
  raster: [
    'bounds',
    'minzoom',
    'maxzoom',
    'tileSize',
    'scheme',
    'attribution',
    'volatile',
  ],
  'raster-dem': [
    'bounds',
    'tileSize',
    'minzoom',
    'maxzoom',
    'encoding',
    'attribution',
  ],
  geojson: [
    'cluster',
    'clusterRadius',
    'clusterMaxZoom',
    'clusterMinPoints',
    'clusterProperties',
    'maxzoom',
    'attribution',
    'buffer',
    'tolerance',
    'lineMetrics',
    'generateId',
    'promoteId',
    'filter',
  ],
  video: ['urls'],
  canvas: ['canvas', 'animate'],
  // image has no non-reactive props — omitted
}

export function getSourceRemountKey(id: string, source: SourceLike): string {
  const nonReactiveKeys = NON_REACTIVE_PROPS_BY_TYPE[source.type ?? ''] ?? []
  if (nonReactiveKeys.length === 0) return id

  const fingerprint = nonReactiveKeys
    .map((key) =>
      typeof source[key] !== 'undefined'
        ? `${key}:${JSON.stringify(source[key])}`
        : null,
    )
    .filter(Boolean)
    .join('|')

  return `${id}:${fingerprint}`
}
