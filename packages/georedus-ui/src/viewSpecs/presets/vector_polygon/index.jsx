import { schemeCategory10 } from 'd3-scale-chromatic'
import { resolveColor } from '../../util'
import { SVG_PATTERNS } from '@orioro/react-maplibre-util'
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
function svgBgImage(svg) {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
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
    fill_pattern,
    ...props
  },
  allViewSpecs,
  context,
) {
  if (!source_layer) {
    throw new Error('source_layer must be defined')
  }

  const _color = resolveColor(color)
  const _fill_pattern =
    fill_pattern && typeof SVG_PATTERNS[fill_pattern] === 'function'
      ? {
          legendItemProps: {
            box: {
              style: {
                borderColor: _color,
                borderStyle: line.paint && line.paint["line-dasharray"] ? 'dashed' : 'line',
                borderWidth: '1px',
                backgroundImage: svgBgImage(
                  SVG_PATTERNS[fill_pattern]({
                    stroke: _color,
                    scale: '0.25',
                  }),
                ),
              },
            },
          },
          str: `${fill_pattern}({ stroke: "${_color}", scale: 0.5 })`,
        }
      : null

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
          'line-color': _color,
          ...line.paint,
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
          'fill-color': _color,
          ...(_fill_pattern ? { 'fill-pattern': _fill_pattern.str } : {}),
          ...fill.paint,
        },
        legends: [
          {
            type: 'CategoricalLegend',
            items: _fill_pattern
              ? [
                  {
                    label,
                    ..._fill_pattern.legendItemProps
                  },
                ]
              : [
                  {
                    color: _color,
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
