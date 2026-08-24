import { resolve } from '@orioro/resolve'
import {
  resolveColor,
  GEOREDUS_LABELED_RESTRICTED_USE_COLORS,
  schemeGeoReDUS,
  zoomSensitiveLinearSizes,
} from '../../util'
import { Z_OVERLAY_BASE_1000 } from '../../zIndexes'
import { basicTooltip, LINE_PATTERN_SOLID, LINE_WIDTH_1 } from '../util'

const WIDTH_MAX = 10
const WIDTH_MIN = 1

function _validNumericalValues(values) {
  return values.filter(
    (value) => typeof value === 'number' && !Number.isNaN(value),
  )
}

const NO_DATA_COLOR = GEOREDUS_LABELED_RESTRICTED_USE_COLORS.cinza_claro.value

function _main_line_legends(props, viewSpec, allViewSpecs, context) {
  const _legend = resolve.fn((ctx) => {
    const _resolvedColor =
      resolveColor(viewSpec.style?.color) || schemeGeoReDUS.laranja

    const legends = [
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
    ]

    if (viewSpec.style?.lineWidth?.valueKey && ctx.view?.metadata?.widthData) {
      const _values = _validNumericalValues(ctx.view.metadata.widthData.values)
      if (_values.length > 0) {
        legends.push({
          type: 'ProportionalSymbolLegend',
          unit: viewSpec.measure_unit,
          title: viewSpec.label,
          min: Math.min(..._values),
          max: Math.max(..._values),
          sizeMin: WIDTH_MIN,
          sizeMax: WIDTH_MAX,
          numberFormat: viewSpec.style?.lineWidth?.numberFormat || ['pt-BR', { maximumFractionDigits: 0 }],
        })
      }
    }

    return legends
  })

  return [_legend]
}

function _main_line({ _maplibreColorExp }, viewSpec, allViewSpecs, context) {
  const { source_layer } = viewSpec

  const line = resolve.fn((ctx) => {
    const _linePattern =
      ctx.view?.conf?.style?.linePattern ||
      viewSpec.style?.linePattern ||
      LINE_PATTERN_SOLID

    if (_linePattern === 'none') {
      return null
    }

    let _lineWidth
    if (viewSpec.style?.lineWidth && typeof viewSpec.style.lineWidth === 'object' && viewSpec.style.lineWidth.valueKey && ctx.view?.metadata?.widthData) {
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

    const paint = {
      dashed: { 'line-dasharray': [4, 2], 'line-width': _lineWidth },
      dotted: { 'line-dasharray': [0.5, 2], 'line-width': _lineWidth },
      solid: { 'line-width': _lineWidth },
    }[_linePattern]

    return {
      zIndex: Z_OVERLAY_BASE_1000,
      source: 'main',
      'source-layer': source_layer,
      type: 'line',
      layout:
        _linePattern === 'dotted'
          ? {
              'line-cap': 'round',
            }
          : {},
      paint: {
        'line-color': _maplibreColorExp,
        ...paint,
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

  const _maplibreColorExp = resolve.fn((ctx) => [
    'match',
    ['get', styleSpec.categoryKey],
    ...ctx.view.metadata.categories
      .map((cat) => [cat.value, resolveColor(cat.color)])
      .flat(),
    '#CCCCCC',
  ])

  return {
    [`main_line`]: _main_line(
      { _maplibreColorExp },
      viewSpec,
      allViewSpecs,
      context,
    ),
  }
}
