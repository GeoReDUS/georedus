import { schemeCategory10 } from 'd3-scale-chromatic'
import { circles_1, waves_1 } from '@orioro/react-maplibre-util'
import { Z_OVERLAY_BASE_1000, Z_OVERLAY_TOP_3000 } from '../../zIndexes'
import { interpolate } from '@orioro/util'
import { resolve } from '@orioro/resolve'
import { resolveColor } from '../../util'

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

export function vector_circle(
  {
    label,
    circle = {},
    color,
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

  const _color = resolveColor(color)
  const _circle_pattern = {
    legendItemProps: {
      box: {
        style: {
          backgroundColor: _color,
          border: '1px solid black',
          borderRadius: '30px'
        },
      },
    },
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
      [`main_circle`]: {
        zIndex: Z_OVERLAY_TOP_3000,
        source: 'main',
        'source-layer': source_layer,
        type: 'circle',
        ...circle,
        paint: {
          'circle-radius': 8,
          'circle-color': _color,
          'circle-opacity': 1,
          'circle-stroke-color': '#000000',
          'circle-stroke-width': 1,
          ...(circle.paint || {}),
        },
        legends: [
          {
            type: 'CategoricalLegend',
            items: [
              {
                label,
                ..._circle_pattern.legendItemProps,
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
