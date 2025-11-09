import { slugify } from '@orioro/util'

const MAP_TILER_API_KEY = process.env.NEXT_PUBLIC_MAP_TILER_API_KEY

export * from './maptiler-dataviz-map-style'
export * from './maptiler-satellite-map-style'

export function mapTilerSpecFromStyleJson({
  styleJson,
  topLayerIds = [],
  apiKey = MAP_TILER_API_KEY,
}) {
  function _addApiKey(url) {
    return url ? url + '?key=' + apiKey : null
  }

  const sources = Object.fromEntries(
    Object.entries(styleJson.sources).map(([id, source]) => [
      id,
      source.url
        ? {
            ...source,
            url: _addApiKey(source.url),
          }
        : source,
    ]),
  )

  const allLayers = styleJson.layers.map((layer) => {
    const layerId = slugify(layer.id, '_')

    return {
      ...layer,
      id: layerId,
      //
      // Link layer to its original source using
      // absolute sourceId
      //
      absoluteSourceId: layer.source,
    }
  })

  const layersById = Object.fromEntries(
    allLayers.map((layer) => [layer.id, layer]),
  )

  const topLayers = topLayerIds.map((layerId) => layersById[layerId])
  const baseLayers = allLayers.filter(
    (layer) => !topLayerIds.includes(layer.id),
  )

  const glyphs = _addApiKey(styleJson.glyphs)
  const sprite = styleJson.sprite

  const fullMapStyle = {
    ...styleJson,
    layers: allLayers,
    sources,
    glyphs,
    sprite,
  }

  return {
    fullMapStyle,
    sources,
    allLayers,
    layersById,
    topLayers,
    baseLayers,
    glyphs,
    sprite,
  }
}
