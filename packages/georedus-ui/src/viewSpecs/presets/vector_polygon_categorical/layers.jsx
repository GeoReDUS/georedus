import { SVG_PATTERNS } from '@orioro/react-maplibre-util'
import { resolveColor } from '../../util'
import { Z_OVERLAY_BASE_1000 } from '../../zIndexes'
import {
  FILL_PATTERN_SOLID,
  svgBgImage,
  basicTooltip,
  applyOpacity,
  DEFAULT_FILL_OPACITY,
} from '../util'
import { resolve } from '@orioro/resolve'

import { MAIN_SOURCE_ID } from './sources'

function _main_line({ _maplibreColorExp }, viewSpec, allViewSpecs, context) {
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
    source: MAIN_SOURCE_ID,
    'source-layer': source_layer,
    type: 'line',
    layout:
      borderStyle === 'dotted'
        ? {
            'line-cap': 'round',
          }
        : {},
    paint: {
      'line-color': _maplibreColorExp,
      'line-width': 2,
      ...paint,
    },
  }
}

function _main_fill_legends(props, viewSpec, allViewSpecs, context) {
  const { _fillPattern } = props

  const _legends = resolve.fn([_fillPattern], ([resolvedFillPattern], ctx) => {
    const categories = ctx.view.metadata.categories
    const _confOpacity = ctx.view?.conf?.style?.opacity || viewSpec.style.opacity

    return [
      {
        type: 'CategoricalLegend',
        title: viewSpec.label,
        items: categories.map((cat) => {
          const boxStyle =
            resolvedFillPattern && resolvedFillPattern !== FILL_PATTERN_SOLID
              ? {
                  backgroundColor: 'transparent',
                  backgroundImage:
                    typeof SVG_PATTERNS[resolvedFillPattern] === 'function'
                      ? svgBgImage(
                          SVG_PATTERNS[resolvedFillPattern]({
                            stroke: resolveColor(cat.color),
                            scale: '0.25',
                          }),
                        )
                      : '',
                }
              : {
                  backgroundColor: applyOpacity(
                    resolveColor(cat.color),
                    typeof _confOpacity === 'number'
                      ? _confOpacity
                      : DEFAULT_FILL_OPACITY,
                  ),
                }
          return {
            id: cat.value,
            label: cat.label,
            color: resolveColor(cat.color),
            box: {
              style: boxStyle,
            },
          }
        }),
      },
    ]
  })

  return _legends
}

function _main_fill(props, viewSpec, allViewSpecs, context) {
  const { _maplibreColorExp, _fillPattern } = props
  const { source_layer } = viewSpec

  const _fillPaint = resolve.fn(
    [_fillPattern],
    ([resolvedFillPattern], ctx) => {
      const resolvedFillPatternStr =
        resolvedFillPattern && resolvedFillPattern !== FILL_PATTERN_SOLID
          ? [
              'match',
              ['get', viewSpec.style.categoryKey],
              ...ctx.view.metadata.categories
                .map((cat) => [
                  cat.value,
                  `${resolvedFillPattern}({ stroke: "${resolveColor(cat.color)}", scale: 0.5 })`,
                ])
                .flat(),
              '#CCCCCC',
            ]
          : null

      const _confOpacity = ctx.view?.conf?.style?.opacity || viewSpec.style.opacity

      return {
        'fill-color': _maplibreColorExp,
        'fill-opacity':
          typeof _confOpacity === 'number'
            ? _confOpacity
            : DEFAULT_FILL_OPACITY,
        ...(resolvedFillPatternStr
          ? { 'fill-pattern': resolvedFillPatternStr }
          : {}),
      }
    },
  )

  return {
    zIndex: Z_OVERLAY_BASE_1000,
    source: MAIN_SOURCE_ID,
    'source-layer': source_layer,
    type: 'fill',
    paint: _fillPaint,
    legends: _main_fill_legends(props, viewSpec, allViewSpecs, context),
    tooltip: basicTooltip(viewSpec.tooltip),
  }
}

export function layers(viewSpec, allViewSpecs, context) {
  const styleSpec = viewSpec.style

  const { source_layer } = viewSpec

  if (!source_layer) {
    throw new Error('source_layer must be defined')
  }

  const _maplibreColorExp = resolve.fn((ctx) => [
    'match',
    ['get', viewSpec.style.categoryKey],
    ...ctx.view.metadata.categories
      .map((cat) => [cat.value, resolveColor(cat.color)])
      .flat(),
    '#CCCCCC',
  ])

  const _fillPattern = resolve.fn(
    (ctx) => ctx.view?.conf?.style?.fillPattern || styleSpec.fillPattern,
  )

  return {
    [`main_line`]: _main_line(
      { _maplibreColorExp },
      viewSpec,
      allViewSpecs,
      context,
    ),
    [`main_fill`]: _main_fill(
      { _maplibreColorExp, _fillPattern },
      viewSpec,
      allViewSpecs,
      context,
    ),
  }
}
