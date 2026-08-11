import { Z_OVERLAY_BASE_1000 } from '../../zIndexes'
import { applyOpacity } from '../util'
import { resolve } from '@orioro/resolve'
import { MAIN_SOURCE_ID } from './sources'
import { resolveColor } from '../../util'

const DEFAULT_FILL_OPACITY = 1

function _main_heatmap_legends(props, viewSpec, allViewSpecs, context) {
  const _legends = resolve.fn((ctx) => {
    return [
      {
        type: 'CategoricalLegend',
        title: viewSpec.label,
        items: ctx.view.metadata.steps.map((item) => ({
          id: item.label,
          label: item.label,
          color: resolveColor(item.color),
        })),
      },
    ]
  })
  return _legends
}

function _main_heatmap(props, viewSpec, allViewSpecs, context) {
  const {} = props
  const { source_layer } = viewSpec

  const heatmap = resolve.fn((ctx) => {
    const _confOpacity = ctx.view?.conf?.style?.opacity

    return {
      zIndex: Z_OVERLAY_BASE_1000,
      source: MAIN_SOURCE_ID,
      'source-layer': source_layer,
      interactive: true,
      type: 'heatmap',
      minzoom: viewSpec.style.minzoom || 7,
      ...(viewSpec.style.maxzoom ? { maxzoom: viewSpec.style.maxzoom } : {}),
      paint: {
        'heatmap-weight': viewSpec.style.weight || 1,
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0,
          'transparent',
          ...ctx.view.metadata.steps.flatMap((item) => [
            item.step,
            resolveColor(item.color),
          ]),
        ],
        'heatmap-radius':
          viewSpec.style.radius && Array.isArray(viewSpec.style.radius)
            ? ['interpolate', ['linear'], ['zoom'], ...viewSpec.style.radius]
            : viewSpec.style.radius || [
                'interpolate',
                ['linear'],
                ['zoom'],
                9,
                2,
                17,
                30,
              ],
        'heatmap-opacity': viewSpec.style.circle
          ? ['interpolate', ['linear'], ['zoom'], 12, 1, 16, 0]
          : typeof _confOpacity === 'number'
            ? _confOpacity
            : viewSpec.style.opacity
              ? viewSpec.style.opacity
              : DEFAULT_FILL_OPACITY,
      },
      legends: _main_heatmap_legends(props, viewSpec, allViewSpecs, context),
    }
  })
  return heatmap
}

function _main_circle(props, viewSpec, allViewSpecs, context) {
  const { source_layer } = viewSpec

  const circle = resolve.fn((ctx) => {
    const _opacity = viewSpec.style.opacity
      ? viewSpec.style.opacity
      : viewSpec.style.opacity || [
          'interpolate',
          ['linear'],
          ['zoom'],
          14,
          0,
          17,
          1,
        ]

    return {
      zIndex: Z_OVERLAY_BASE_1000,
      source: MAIN_SOURCE_ID,
      'source-layer': source_layer,
      type: 'circle',
      interactive: true,
      minzoom: 14,
      paint: {
        'circle-color': resolveColor(
          ctx.view.metadata.steps[
            Math.floor(ctx.view.metadata.steps.length / 2)
          ].color,
        ),
        'circle-stroke-color': '#FFFFFF',
        'circle-stroke-width': 2,
        'circle-stroke-opacity': _opacity,
        'circle-radius':
          viewSpec.style.circle_radius && Array.isArray(viewSpec.style.circle_radius)
            ? ['interpolate', ['linear'], ['zoom'], ...viewSpec.style.circle_radius]
            : viewSpec.style.circle_radius || [
                'interpolate',
                ['linear'],
                ['zoom'],
                11,
                2,
                17,
                10,
              ],
        'circle-opacity': _opacity,
      },
    }
  })
  return circle
}

export function layers(viewSpec, allViewSpecs, context) {
  const { source_layer } = viewSpec

  if (!source_layer) {
    throw new Error('source_layer must be defined')
  }

  return {
    [`main_heatmap`]: _main_heatmap({}, viewSpec, allViewSpecs, context),
    [`main_circle`]:
      viewSpec.style.circle &&
      _main_circle({}, viewSpec, allViewSpecs, context),
  }
}
