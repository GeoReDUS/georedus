import { interpolate } from '@orioro/util'

function _parseTiles(tiles, context) {
  tiles = Array.isArray(tiles)
    ? tiles
    : typeof tiles === 'string'
      ? [tiles]
      : null

  if (!tiles) {
    throw new Error(`tiles is required`)
  }

  return tiles.map((tileSrcUrl) => interpolate(tileSrcUrl, context))
}

export function sources(viewSpec, allViewSpecs, context) {
  const { tiles } = viewSpec

  return {
    main: {
      promoteId: 'id',
      type: 'vector',
      tiles: _parseTiles(tiles, context),
    },
  }
}
