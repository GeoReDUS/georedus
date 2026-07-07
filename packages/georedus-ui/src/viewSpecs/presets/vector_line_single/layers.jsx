import { resolve } from '@orioro/resolve'
import { resolveColor } from '../../util'
import { Z_OVERLAY_BASE_1000 } from '../../zIndexes'
import { basicTooltip, LINE_PATTERN_SOLID, LINE_WIDTH_1 } from '../util'

function _main_line_legends({ _color }, viewSpec, allViewSpecs, context) {
  const _legend = resolve.fn([_color], (resolvedColor, ctx) => {
    return {
      type: 'CategoricalLegend',
      items: [
        {
          label: viewSpec.label,
          box: {
            style: {
              height: 0,
              borderColor: resolvedColor,
              borderTopStyle:
                ctx.view?.conf?.style?.linePattern ||
                styleSpec.linePattern ||
                LINE_PATTERN_SOLID,
              borderBottomStyle: 'none',
              borderWidth: ctx.view?.conf?.style?.lineWidth || viewSpec.style?.lineWidth || LINE_WIDTH_1,
            },
          },
        },
      ],
    }
  })

  return [_legend]
}

function _main_line({ _color, _linePattern }, viewSpec, allViewSpecs, context) {
  const { source_layer } = viewSpec

  const line = resolve.fn([_color], (resolvedColor, ctx) => {
    const _linePattern =
      ctx.view?.conf?.style?.linePattern ||
      viewSpec.style?.linePattern ||
      LINE_PATTERN_SOLID
    
    if (_linePattern === 'none') {
      return null
    }

    const _lineWidth = ctx.view?.conf?.style?.lineWidth || viewSpec.style?.lineWidth || LINE_WIDTH_1
    
    const paint = {
      dashed: { 'line-dasharray': [4, 2], 'line-width': _lineWidth },
      dotted: { 'line-dasharray': [0.5, 2], 'line-width': _lineWidth },
      solid: { 'line-width': _lineWidth },
    }[_linePattern]

    return {
      zIndex: Z_OVERLAY_BASE_1000,
      source: 'main',
      'source-layer': source_layer,
      type: 'line',
      layout:
        _linePattern === 'dotted'
          ? {
              'line-cap': 'round',
            }
          : {},
      paint: {
        'line-color': _color,
        ...paint,
      },
      legends: _main_line_legends({ _color }, viewSpec, allViewSpecs, context),
      tooltip: basicTooltip(viewSpec.tooltip),
    }
  })
  return line
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

  return {
    [`main_line`]: _main_line({ _color }, viewSpec, allViewSpecs, context),
  }
}
