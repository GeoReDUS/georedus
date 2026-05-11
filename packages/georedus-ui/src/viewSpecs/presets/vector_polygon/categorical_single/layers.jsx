import { Z_OVERLAY_BASE_1000 } from '../../../zIndexes'
import { resolve } from '@orioro/resolve'

function _fill() {}
function _line() {}
function _legends() {}

export function layers(viewSpec, allViewSpecs, context) {
  const styleSpec = viewSpec.style

  const { source_layer } = viewSpec

  if (!source_layer) {
    throw new Error('source_layer must be defined')
  }

  return {
    // [`main_line`]: {
    //   zIndex: Z_OVERLAY_BASE_1000,
    //   source: 'main',
    //   'source-layer': source_layer,
    //   type: 'line',
    //   // ...line,
    //   paint: _linePaint,
    // },
    [`main_fill`]: {
      zIndex: Z_OVERLAY_BASE_1000,
      source: 'main',
      'source-layer': source_layer,
      type: 'fill',
      // ...fill,
      // layout: {
      //   ...fill['layout'],
      // },
      paint: {
        'fill-color': 'red',
      },
    },
  }
}
