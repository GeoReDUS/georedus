import { Z_OVERLAY_BASE_1000 } from '../../zIndexes'
import { applyOpacity, DEFAULT_FILL_OPACITY } from '../util'
import { resolve } from '@orioro/resolve'
import { MAIN_SOURCE_ID } from './sources'
import { resolveColor } from '../../util'

const colorScheme = COLOR_SCHEMES[viewSpec.style.colorScheme]

function _main_heatmap_legends(props, viewSpec, allViewSpecs, context) {
  const _legends = resolve.fn((ctx) => {
    return [
      {
        type: 'CategoricalLegend',
        title: viewSpec.label,
        items: viewSpec.style.color.map((item) => ({
          id: item.label,
          label: item.label,
          box: {
            style: {
              backgroundColor: applyOpacity(
                resolveColor(item.color),
                DEFAULT_FILL_OPACITY,
              ),
            },
          },
        })),
      },
    ]
  })
  return _legends
}

function _main_heatmap(props, viewSpec, allViewSpecs, context) {
  const {} = props
  const { source_layer } = viewSpec
  
  return {
    zIndex: Z_OVERLAY_BASE_1000,
    source: MAIN_SOURCE_ID,
    'source-layer': source_layer,
    interactive: false,
    type: 'heatmap',
    // maxzoom: 14,
    paint: {
      'heatmap-weight': viewSpec.style.weight || 1, // ['interpolate', ['linear'], ['get', 'mag'], 0, 0, 6, 1], Implementar magnitude de acordo com variableId?
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0,
        'transparent',
        ...viewSpec.style.color.flatMap((item) => [item.step, resolveColor(item.color)]),
      ],
      'heatmap-radius': viewSpec.style.radius || ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 10],
      'heatmap-opacity': viewSpec.style.opacity || DEFAULT_FILL_OPACITY,
    },
    legends: _main_heatmap_legends(props, viewSpec, allViewSpecs, context),
  }
}

export function layers(viewSpec, allViewSpecs, context) {
  const { source_layer } = viewSpec

  if (!source_layer) {
    throw new Error('source_layer must be defined')
  }
  
  return {
    [`main_heatmap`]: _main_heatmap({}, viewSpec, allViewSpecs, context),
  }
}
