import { schemeCategory10 } from 'd3-scale-chromatic'
import { waves_1 } from '@orioro/react-maplibre-util'
import { Z_OVERLAY_BASE_1000 } from '../../zIndexes'
import { interpolate } from '@orioro/util'
import { resolve } from '@orioro/resolve'

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

export function vector_polygon(
  {
    label,
    color,
    line = {},
    fill = {},
    tiles,
    source_layer,
    sources = {},
    layers = {},
    ...props
  },
  allViewSpecs,
  context,
) {
  if (!source_layer) {
    throw new Error('source_layer must be defined')
  }

  return {
    ...props,
    label,
    metadata: {},
    sources: {
      main: {
        promoteId: 'id',
        type: 'vector',
        tiles: _parseTiles(tiles, context),
      },
      ...sources,
    },
    layers: {
      [`main_line`]: {
        zIndex: Z_OVERLAY_BASE_1000,
        source: 'main',
        'source-layer': source_layer,
        type: 'line',
        ...line,
        paint: {
          'line-color': color,
        },
      },
      [`main_fill`]: {
        zIndex: Z_OVERLAY_BASE_1000,
        source: 'main',
        'source-layer': source_layer,
        type: 'fill',
        ...fill,
        paint: {
          'fill-opacity': 0.5,
          'fill-color': color,
          ...fill.paint,
        },
        legends: [
          {
            type: 'CategoricalLegend',
            items: [
              {
                color,
                label,
              },
            ],
          },
        ],
        tooltip: {
          title: [
            '$literal',
            resolve.fn((ctx) => {
              return ctx?.feature?.properties?.name
            }),
          ],
          entries: [
            '$literal',
            resolve.fn((ctx) => {
              return typeof ctx.feature?.properties === 'object'
                ? Object.entries(ctx.feature.properties)
                : []
            }),
          ],
        },
      },
      ...layers,
    },
  }
}
