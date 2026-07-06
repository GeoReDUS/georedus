import { Z_OVERLAY_BASE_1000 } from '../../zIndexes'
import { applyOpacity } from '../util'
import { resolve } from '@orioro/resolve'
import { MAIN_SOURCE_ID } from './sources'
import { resolveColor } from '../../util'


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
    return {
      zIndex: Z_OVERLAY_BASE_1000,
      source: MAIN_SOURCE_ID,
      'source-layer': source_layer,
      interactive: true,
      type: 'heatmap',
      minzoom: 7,
      // maxzoom: 17,
      paint: {
        'heatmap-weight': 1,
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
        'heatmap-radius': ctx.view.metadata.radius || [
          'interpolate',
          ['linear'],
          ['zoom'],
          9,
          2,
          17,
          30,
        ],
        // 'heatmap-opacity': viewSpec.style.opacity || DEFAULT_FILL_OPACITY,
        // 'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 14, 1, 18, 0],
      },
      legends: _main_heatmap_legends(props, viewSpec, allViewSpecs, context),
    }
  })
  return heatmap
}

function _main_circle(props, viewSpec, allViewSpecs, context) {
  const { source_layer } = viewSpec

  return {
    zIndex: Z_OVERLAY_BASE_1000,
    source: MAIN_SOURCE_ID,
    'source-layer': source_layer,
    type: 'circle',
    interactive: true,
    minzoom: 14,
    paint: {
      'circle-color': resolveColor(viewSpec.style.steps[0].color),
      'circle-stroke-color': '#FFFFFF',
      'circle-stroke-width': 2,
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 14, 3, 18, 9],
      'circle-opacity': ['interpolate', ['linear'], ['zoom'], 15, 0, 17, 1],
    },
  }
}

export function layers(viewSpec, allViewSpecs, context) {
  const { source_layer } = viewSpec

  if (!source_layer) {
    throw new Error('source_layer must be defined')
  }

  return {
    [`main_heatmap`]: _main_heatmap({}, viewSpec, allViewSpecs, context),
    // [`main_circle`]: _main_circle({}, viewSpec, allViewSpecs, context),
  }
}
