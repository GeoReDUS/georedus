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

// function _extractStepsFromStepExpression(stepExpr) {
//   if (!Array.isArray(stepExpr) || stepExpr[0] !== 'step') {
//     return null
//   }

//   const steps = []
//   const defaultColor = stepExpr[2]
  
//   // Add default step (value 0)
//   steps.push({ value: 0, color: defaultColor })
  
//   // Parse alternating value, color pairs starting from index 3
//   for (let i = 3; i < stepExpr.length; i += 2) {
//     steps.push({
//       value: stepExpr[i],
//       color: stepExpr[i + 1]
//     })
//   }
  
//   return steps
// }

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
    fill_pattern || line
      ? {
          legendItemProps: {
            box: {
              style: {
                borderColor: line?.paint && line.paint["line-color"] ? line.paint["line-color"] : _color,
                borderStyle: line?.paint && line.paint["line-dasharray"] ? 'dashed' : 'solid',
                borderWidth: '1px',
                backgroundImage: fill_pattern && typeof SVG_PATTERNS[fill_pattern] === 'function' ? svgBgImage(
                  SVG_PATTERNS[fill_pattern]({
                    stroke: _color,
                    scale: '0.25',
                  }),
                ) : '',
              },
            },
          },
          str: fill_pattern ? `${fill_pattern}({ stroke: "${_color}", scale: 0.5 })` : null,
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
        layout: {
          ...fill["layout"]
        },
        paint: {
          'fill-opacity': fill.paint && fill.paint["fill-opacity"] ? fill.paint["fill-opacity"] : 0.5,
          'fill-color': _color,
          ...fill["paint"],
          ...(_fill_pattern?.str ? { 'fill-pattern': _fill_pattern.str } : {}),
        },
        legends: 
        // fill?.paint?.["fill-color"] && Array.isArray(fill.paint["fill-color"])
        // ? [
        //     {
        //       type: 'SequentialColorLegend',
        //       steps: _extractStepsFromStepExpression(fill.paint["fill-color"])
        //     }
        //   ]
        // :
        [
          {
            type: 'CategoricalLegend',
            items: _fill_pattern
              ? [
                  {
                    label,
                    color: _color,
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
