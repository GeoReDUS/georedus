import { Z_OVERLAY_BASE_1000 } from '../../zIndexes'
import { basicTooltip } from '../util'
import { resolve } from '@orioro/resolve'

import { MAIN_SOURCE_ID } from './sources'
import {
  GEOREDUS_LABELED_RESTRICTED_USE_COLORS,
  resolveColor,
  schemeGeoReDUS,
  zoomSensitiveLinearSizes,
} from '../../util'
import { color } from '@orioro/react-ui-core'

function _main_circle_legends(props, viewSpec, allViewSpecs, context) {
  const _legends = resolve.fn((ctx) => {
    const _initialColor =
      resolveColor(viewSpec.style.color) || schemeGeoReDUS.laranja
    const _resolvedColor = resolve.fn(
      (ctx) => resolveColor(ctx.view?.conf?.style?.color) || _initialColor,
    )

    return [
      {
        type: 'CategoricalLegend',
        items: [
          {
            label: viewSpec.label,
            box: {
              style: {
                backgroundColor: _resolvedColor,
                border: 'none',
                borderRadius: '30px',
                opacity: viewSpec.style.opacity || 1,
              },
            },
          },
        ],
      },
    ]
  })
  return _legends
}

function _main_circle(props, viewSpec, allViewSpecs, context) {
  const {} = props
  const { source_layer } = viewSpec
  return {
    zIndex: Z_OVERLAY_BASE_1000,
    source: MAIN_SOURCE_ID,
    'source-layer': source_layer,
    interactive: true,
    type: 'circle',

    paint: {
      'circle-color': resolve.fn((ctx) => {
        const _initialColor =
          resolveColor(viewSpec.style.color) || schemeGeoReDUS.laranja
        const _resolvedColor = resolve.fn(
          (ctx) => resolveColor(ctx.view?.conf?.style?.color) || _initialColor,
        )

        if (viewSpec.style.radius?.valueKey) {
          return [
            'case',
            [
              '==',
              ['typeof', ['get', viewSpec.style.radius.valueKey]],
              'number',
            ],
            _resolvedColor,
            NO_DATA_COLOR,
          ]
        } else {
          return _resolvedColor
        }
      }),
      'circle-opacity': viewSpec.style.opacity || 1,
      'circle-radius': resolve.fn((ctx) => {
        return viewSpec.style.radius || 10
      }),
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': viewSpec.style.border === false ? 0 : 2,
    },
    legends: _main_circle_legends(props, viewSpec, allViewSpecs, context),
    tooltip: basicTooltip(viewSpec.tooltip),
  }
}

export function layers(viewSpec, allViewSpecs, context) {
  const styleSpec = viewSpec.style
  // console.log('styleSpec', styleSpec)
  const { source_layer } = viewSpec

  if (!source_layer) {
    throw new Error('source_layer must be defined')
  }

  return {
    [`main_circle`]: _main_circle({}, viewSpec, allViewSpecs, context),
  }
}
