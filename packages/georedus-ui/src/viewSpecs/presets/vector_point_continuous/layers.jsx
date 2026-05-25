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

const SIZE_MAX = 25
const SIZE_MIN = 6

function _validNumericalValues(values) {
  return values.filter(
    (value) => typeof value === 'number' && !Number.isNaN(value),
  )
}

const NO_DATA_COLOR = GEOREDUS_LABELED_RESTRICTED_USE_COLORS.cinza_claro.value

function _main_circle_legends(props, viewSpec, allViewSpecs, context) {
  const _legends = resolve.fn((ctx) => {
    const _values = _validNumericalValues(ctx.view.metadata.radiusData.values)

    const _resolvedColor =
      resolveColor(viewSpec.style.color) || schemeGeoReDUS.laranja

    return [
      {
        type: 'CategoricalLegend',
        title: viewSpec.label,

        items: [
          {
            label: 'Com dados',
            color: _resolvedColor,
          },
          {
            label: 'Sem dados',
            color: NO_DATA_COLOR,
          },
        ],
      },
      {
        type: 'ProportionalSymbolLegend',
        unit: viewSpec.measure_unit,
        title: viewSpec.label,
        min: Math.min(..._values),
        max: Math.max(..._values),
        sizeMin: SIZE_MIN * 2,
        sizeMax: SIZE_MAX * 2,
        numberFormat: ['pt-BR', { maximumFractionDigits: 0 }],
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

    // 'circle-sort-key': resolve.fn((ctx) => {
    //   if (!viewSpec.style.radius?.valueKey) {
    //     return 0
    //   }

    //   return ['coalesce', ['get', viewSpec.style.radius.valueKey], 0]
    // }),
    paint: {
      'circle-color': resolve.fn((ctx) => {
        const _resolvedColor =
          resolveColor(viewSpec.style.color) || schemeGeoReDUS.laranja

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
      'circle-opacity': 1,
      'circle-radius': resolve.fn((ctx) => {
        if (!viewSpec.style.radius?.valueKey) {
          return 10
        }

        const values = _validNumericalValues(
          ctx.view.metadata.radiusData.values,
        )

        return zoomSensitiveLinearSizes({
          variable: ['get', viewSpec.style.radius.valueKey],
          minValue: Math.min(...values),
          maxValue: Math.max(...values),
          minSize: SIZE_MIN,
          maxSize: SIZE_MAX,
        })
      }),
    },
    legends: _main_circle_legends(props, viewSpec, allViewSpecs, context),
    tooltip: basicTooltip(viewSpec.tooltip),
  }
}

export function layers(viewSpec, allViewSpecs, context) {
  const styleSpec = viewSpec.style

  const { source_layer } = viewSpec

  if (!source_layer) {
    throw new Error('source_layer must be defined')
  }

  return {
    [`main_circle`]: _main_circle({}, viewSpec, allViewSpecs, context),
  }
}
