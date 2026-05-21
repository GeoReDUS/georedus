import { SVG_PATTERNS } from '@orioro/react-maplibre-util'
import { resolveColor } from '../../util'
import { Z_OVERLAY_BASE_1000 } from '../../zIndexes'
import {
  FILL_PATTERN_SOLID,
  svgBgImage,
  applyOpacity,
  basicTooltip,
  DEFAULT_FILL_OPACITY,
} from '../util'
import { resolve } from '@orioro/resolve'

function _main_fill_legends(
  { _color, _fillPattern },
  viewSpec,
  allViewSpecs,
  context,
) {
  const _legend = resolve.fn(
    [_color, _fillPattern],
    ([resolvedColor, resolvedFillPattern], ctx) => {
      const patternProps =
        resolvedFillPattern && resolvedFillPattern !== FILL_PATTERN_SOLID
          ? {
              color: resolvedColor,
              backgroundColor: 'transparent',
              backgroundImage:
                resolvedFillPattern &&
                typeof SVG_PATTERNS[resolvedFillPattern] === 'function'
                  ? svgBgImage(
                      SVG_PATTERNS[resolvedFillPattern]({
                        stroke: resolvedColor,
                        scale: '0.25',
                      }),
                    )
                  : '',
            }
          : {
              backgroundColor: applyOpacity(
                resolvedColor,
                DEFAULT_FILL_OPACITY,
              ),
            }

      const legendItemProps = {
        box: {
          style: {
            borderColor: resolvedColor,
            borderStyle: viewSpec.style?.borderStyle || 'solid',
            borderWidth: '1px',
            ...patternProps,
          },
        },
      }

      return {
        type: 'CategoricalLegend',
        items: [
          {
            label: viewSpec.label,
            color: resolvedColor,
            ...legendItemProps,
          },
        ],
      }
    },
  )

  return [_legend]
}

function _main_fill(props, viewSpec, allViewSpecs, context) {
  const { _color, _fillPattern } = props
  const { source_layer } = viewSpec

  const _fillPaint = resolve.fn(
    [_color, _fillPattern],
    ([resolvedColor, resolvedFillPattern], ctx) => {
      const resolvedFillPatternStr =
        resolvedFillPattern && resolvedFillPattern !== FILL_PATTERN_SOLID
          ? `${resolvedFillPattern}({ stroke: "${resolvedColor}", scale: 0.5 })`
          : null

      return {
        'fill-opacity': DEFAULT_FILL_OPACITY,
        'fill-color': resolvedColor,
        ...(resolvedFillPatternStr
          ? { 'fill-pattern': resolvedFillPatternStr }
          : {}),
      }
    },
  )

  return {
    zIndex: Z_OVERLAY_BASE_1000,
    source: 'main',
    'source-layer': source_layer,
    type: 'fill',
    paint: _fillPaint,
    legends: _main_fill_legends(props, viewSpec, allViewSpecs, context),
    tooltip: basicTooltip(viewSpec.tooltip),
  }
}

function _main_line({ _color, _fillPattern }, viewSpec, allViewSpecs, context) {
  const { source_layer } = viewSpec

  const borderStyle = viewSpec.style?.borderStyle || 'solid'

  if (borderStyle === 'none') {
    return null
  }

  const paint = {
    dashed: { 'line-dasharray': [4, 2], 'line-width': 2 },
    dotted: { 'line-dasharray': [0.5, 2], 'line-width': 2 },
    solid: {},
  }[borderStyle]

  return {
    zIndex: Z_OVERLAY_BASE_1000,
    source: 'main',
    'source-layer': source_layer,
    type: 'line',
    layout:
      borderStyle === 'dotted'
        ? {
            'line-cap': 'round',
          }
        : {},
    paint: {
      'line-color': _color,
      ...paint,
    },
  }
}

export function layers(viewSpec, allViewSpecs, context) {
  const styleSpec = viewSpec.style

  const { source_layer } = viewSpec

  if (!source_layer) {
    throw new Error('source_layer must be defined')
  }

  const _color = resolve.fn((ctx) =>
    resolveColor(ctx.view?.conf?.style?.color || styleSpec.color),
  )

  const _fillPattern = resolve.fn(
    (ctx) => ctx.view?.conf?.style?.fillPattern || styleSpec.fillPattern,
  )

  return {
    [`main_line`]: _main_line(
      { _color, _fillPattern },
      viewSpec,
      allViewSpecs,
      context,
    ),
    [`main_fill`]: _main_fill(
      { _color, _fillPattern },
      viewSpec,
      allViewSpecs,
      context,
    ),
  }
}
