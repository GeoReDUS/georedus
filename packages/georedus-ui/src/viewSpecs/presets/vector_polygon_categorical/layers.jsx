import { SVG_PATTERNS } from '@orioro/react-maplibre-util'
import { resolveColor } from '../../util'
import { Z_OVERLAY_BASE_1000 } from '../../zIndexes'
import {
  FILL_PATTERN_SOLID,
  svgBgImage,
  applyOpacity,
  DEFAULT_FILL_OPACITY,
} from '../util'
import { resolve } from '@orioro/resolve'

import { MAIN_SOURCE_ID } from './sources'

function _main_line() {}

function _main_fill(props, viewSpec, allViewSpecs, context) {
  const {} = props
  const { source_layer } = viewSpec

  const _fillPaint = resolve.fn((context) => {
    const categories = context.view.metadata.categories
    console.log('_fillPaint context', context)

    return {
      'fill-color': 'red',

      'fill-color': [
        'match',
        ['get', 'macrozona'],
        ...categories.map((cat) => [cat.value, cat.color]).flat(),
        '#CCCCCC',
      ],

      'fill-opacity': DEFAULT_FILL_OPACITY,
    }
  })

  // const _fillPaint = resolve.fn(
  //   [_color, _fillPattern],
  //   ([resolvedColor, resolvedFillPattern], ctx) => {
  //     const resolvedFillPatternStr =
  //       resolvedFillPattern && resolvedFillPattern !== FILL_PATTERN_SOLID
  //         ? `${resolvedFillPattern}({ stroke: "${resolvedColor}", scale: 0.5 })`
  //         : null

  //     return {
  //       'fill-opacity': DEFAULT_FILL_OPACITY,
  //       'fill-color': resolvedColor,
  //       ...(resolvedFillPatternStr
  //         ? { 'fill-pattern': resolvedFillPatternStr }
  //         : {}),
  //     }
  //   },
  // )

  return {
    zIndex: Z_OVERLAY_BASE_1000,
    source: MAIN_SOURCE_ID,
    'source-layer': source_layer,
    type: 'fill',
    paint: _fillPaint,
    // legends: _main_fill_legends(props, viewSpec, allViewSpecs, context),
  }
}

export function layers(viewSpec, allViewSpecs, context) {
  const styleSpec = viewSpec.style

  const { source_layer } = viewSpec

  if (!source_layer) {
    throw new Error('source_layer must be defined')
  }

  // const _color = resolve.fn((ctx) =>
  //   resolveColor(ctx.view?.conf?.style?.color || styleSpec.color),
  // )

  // const _fillPattern = resolve.fn(
  //   (ctx) => ctx.view?.conf?.style?.fillPattern || styleSpec.fillPattern,
  // )

  return {
    // [`main_line`]: _main_line(
    //   { _color, _fillPattern },
    //   viewSpec,
    //   allViewSpecs,
    //   context,
    // ),
    [`main_fill`]: _main_fill({}, viewSpec, allViewSpecs, context),
  }
}
