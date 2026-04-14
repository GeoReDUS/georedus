import { schemeCategory10 } from 'd3-scale-chromatic'
import { waves_1 } from '@orioro/react-maplibre-util'
import { Z_OVERLAY_BASE_1000, Z_OVERLAY_MIDDLE_2000 } from '../../zIndexes'
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

export function vector_line(
  {
    label,
    line = {},
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
  const _line_pattern = {
    legendItemProps: {
      box: {
        style: {
          height: 0,
          borderColor: _color,
          borderStyle:
            line.paint && line.paint['line-dasharray'] ? 'dashed' : 'line',
          borderWidth: '1px',
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
      [`main_line`]: {
        zIndex: Z_OVERLAY_MIDDLE_2000,
        source: 'main',
        'source-layer': source_layer,
        type: 'line',
        ...line,
        paint: {
          'line-width': 1,
          'line-color': _color,
          ...(line.paint || {}),
        },
        legends: [
          {
            type: 'CategoricalLegend',
            items: [
              {
                label,
                ..._line_pattern.legendItemProps,
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
