import { resolve } from '@orioro/resolve'
import {
  resolveColor,
  GEOREDUS_LABELED_RESTRICTED_USE_COLORS,
  schemeGeoReDUS,
  zoomSensitiveLinearSizes,
} from '../../util'
import { Z_OVERLAY_BASE_1000 } from '../../zIndexes'
import { basicTooltip, LINE_PATTERN_SOLID, LINE_WIDTH_1 } from '../util'

const WIDTH_MAX = 15
const WIDTH_MIN = 1

const DEFAULT_LINE_OPACITY = 0.7

function _validNumericalValues(values) {
  return values.filter(
    (value) => typeof value === 'number' && !Number.isNaN(value),
  )
}

const NO_DATA_COLOR = GEOREDUS_LABELED_RESTRICTED_USE_COLORS.cinza_claro.value

function _main_line_legends(props, viewSpec, allViewSpecs, context) {
  return resolve.fn((ctx) => {
    const _resolvedColor =
      resolveColor(viewSpec.style?.color) || schemeGeoReDUS.laranja

    const legends = [
      {
        type: 'CategoricalLegend',
        title: viewSpec.label,
        items: [
          {
            label: 'Com dados',
            color: '#CCC',
          },
          {
            label: 'Sem dados',
            color: NO_DATA_COLOR,
          },
        ],
      },
    ]

    // if (viewSpec.style?.lineWidth?.valueKey && ctx.view?.metadata?.widthData) {
    //   const _values = _validNumericalValues(ctx.view.metadata.widthData.values)
    //   if (_values.length > 0) {
    //     legends.push({
    //       type: 'ProportionalSymbolLegend',
    //       unit: viewSpec.measure_unit,
    //       title: viewSpec.label,
    //       min: Math.min(..._values),
    //       max: Math.max(..._values),
    //       sizeMin: WIDTH_MIN,
    //       sizeMax: WIDTH_MAX,
    //       numberFormat: viewSpec.style?.lineWidth?.numberFormat || ['pt-BR', { maximumFractionDigits: 0 }],
    //     })
    //   }
    // }

    return legends
  })
}

function _main_line({ _maplibreColorExp }, viewSpec, allViewSpecs, context) {
  const { source_layer } = viewSpec

  const line = resolve.fn((ctx) => {

    let _lineWidth
    if (
      viewSpec.style?.lineWidth &&
      typeof viewSpec.style.lineWidth === 'object' &&
      viewSpec.style.lineWidth.valueKey &&
      ctx.view?.metadata?.widthData
    ) {
      const values = _validNumericalValues(ctx.view.metadata.widthData.values)
      if (values.length > 0) {
        _lineWidth = zoomSensitiveLinearSizes({
          variable: ['get', viewSpec.style.lineWidth.valueKey],
          minValue: Math.min(...values),
          maxValue: Math.max(...values),
          minSize: WIDTH_MIN,
          maxSize: WIDTH_MAX,
        })
      } else {
        _lineWidth = LINE_WIDTH_1
      }
    } else {
      _lineWidth =
        ctx.view?.conf?.style?.lineWidth ||
        viewSpec.style?.lineWidth ||
        LINE_WIDTH_1
    }

    return {
      zIndex: Z_OVERLAY_BASE_1000,
      source: 'main',
      'source-layer': source_layer,
      type: 'line',
      paint: {
        'line-color': '#AAAAEF',
        'line-opacity': DEFAULT_LINE_OPACITY,
        'line-width': resolve.fn((ctx) => {
          if (!viewSpec.style.lineWidth?.valueKey) {
            return WIDTH_MIN
          }

          const values = _validNumericalValues(
            ctx.view.metadata.widthData.values,
          )

          return zoomSensitiveLinearSizes({
            variable: ['get', viewSpec.style?.lineWidth?.valueKey],
            minValue: Math.min(...values),
            maxValue: Math.max(...values),
            minSize: WIDTH_MIN,
            maxSize: WIDTH_MAX,
          })
        }),
        // ...paint,
      },
      legends: _main_line_legends({}, viewSpec, allViewSpecs, context),
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

  // const _maplibreColorExp = resolve.fn((ctx) => [
  //   'match',
  //   ['get', styleSpec.lineWidth.valueKey],
  //   ...ctx.view.metadata.widthData.values
  //     .map((cat) => [cat.value, resolveColor(cat.color)])
  //     .flat(),
  //   '#CCCCCC',
  // ])

  // const _maplibreColorExp = resolve.fn((ctx) => [
  //   'step',
  //   [
  //     'coalesce',
  //     ['get', styleSpec.lineWidth.valueKey],
  //     Math.min(...ctx.view.metadata.widthData.values) - 1,
  //   ],
  //   ...ctx.view.metadata.widthData.colorScaleStops,
  // ])

  return {
    [`main_line`]: _main_line({}, viewSpec, allViewSpecs, context),
  }
}
