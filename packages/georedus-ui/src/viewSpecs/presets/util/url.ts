import { interpolate } from '@orioro/util'

type Context = {
  VECTOR_TILE_SERVER_ENDPOINT: string
  METADATA_API_ENDPOINT: string
}

export function parseTiles(tiles: string | string[], context: Context) {
  const parsedTiles = Array.isArray(tiles)
    ? tiles
    : typeof tiles === 'string'
      ? [tiles]
      : null

  if (!parsedTiles) {
    throw new Error(`tiles is required`)
  }

  return parsedTiles.map((tileSrcUrl) => interpolate(tileSrcUrl, context))
}

export function parseUrl(urlTemplate: string, context: Context) {
  return interpolate(urlTemplate, context)
}
