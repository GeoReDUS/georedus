import { interpolate } from '@orioro/util'

import { parseStyleSpec } from './parseStyleSpec'
import { categorical_single } from './categorical_single'

const BY_DATA_TYPE = {
  categorical_single,
}

function _resolveUrl(urlStr, context) {
  return interpolate(urlStr, context)
}

function _parseTiles(tiles, context) {
  tiles = Array.isArray(tiles)
    ? tiles
    : typeof tiles === 'string'
      ? [tiles]
      : null

  if (!tiles) {
    throw new Error(`tiles is required`)
  }

  return tiles.map((tileSrcUrl) => _resolveUrl(tileSrcUrl, context))
}

export function vector_polygon(viewSpec, allViewSpecs, context) {
  const {
    label,
    // color,
    // line = {},
    // fill = {},
    sources = {},
    tiles,
    source_layer,
    // fill_pattern,
    parse_style,
    ...props
  } = viewSpec

  if (!source_layer) {
    throw new Error('source_layer must be defined')
  }

  const parsedStyle = parseStyleSpec(viewSpec.style)

  const dataTypeSpecific = BY_DATA_TYPE[parsedStyle?.dataType]
    ? BY_DATA_TYPE[parsedStyle.dataType](
        {
          ...viewSpec,
          style: parsedStyle,
          download_url: _resolveUrl(viewSpec.download_url, context),
        },
        allViewSpecs,
        context,
      )
    : {}

  return {
    ...props,
    label,
    sources: {
      main: {
        promoteId: 'id',
        type: 'vector',
        tiles: _parseTiles(tiles, context),
      },
      ...sources,
    },
    ...dataTypeSpecific,
  }
}
