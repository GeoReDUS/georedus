import { Z_OVERLAY_BASE_1000 } from '../../zIndexes'
import { basicTooltip } from '../util'
import { resolve } from '@orioro/resolve'

import { MAIN_SOURCE_ID } from './sources'
import { resolveColor, schemeGeoReDUS } from '../../util'

function _main_heatmap_legends(props, viewSpec, allViewSpecs, context) {
  const _legends = resolve.fn((ctx) => {
    return [
      {
        type: 'GradientLegend',
        label: viewSpec.label,
        gradient: [
          { color: 'rgb(103,169,207)', label: 'Baixa' },
          { color: 'rgb(209,229,240)', label: '' },
          { color: 'rgb(253,219,199)', label: '' },
          { color: 'rgb(239,138,98)', label: '' },
          { color: 'rgb(178,24,43)', label: 'Alta' },
        ],
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
    maxzoom: 14,
    paint: {
      'heatmap-weight': 1, // ['interpolate', ['linear'], ['get', 'mag'], 0, 0, 6, 1], Implementar magnitude de acordo com variableId?
      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0,
        'rgba(33,102,172,0)',
        0.2,
        'rgb(103,169,207)',
        0.4,
        'rgb(209,229,240)',
        0.6,
        'rgb(253,219,199)',
        0.8,
        'rgb(239,138,98)',
        1,
        'rgb(178,24,43)',
      ],
      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
      'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 9, 0],
    },
    legends: _main_heatmap_legends(props, viewSpec, allViewSpecs, context),
    tooltip: basicTooltip(viewSpec.tooltip),
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
