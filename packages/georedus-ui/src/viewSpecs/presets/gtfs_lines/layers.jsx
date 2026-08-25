import { resolve } from '@orioro/resolve'
import {
  resolveColor,
  GEOREDUS_LABELED_RESTRICTED_USE_COLORS,
  schemeGeoReDUS,
  zoomSensitiveLinearSizes,
} from '../../util'
import { Z_OVERLAY_BASE_1000 } from '../../zIndexes'
import { basicTooltip, LINE_WIDTH_1 } from '../util'
import { WIDTH_MIN, WIDTH_MAX } from './consts'

const DEFAULT_LINE_OPACITY = 0.1

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

    if (viewSpec.style?.lineWidth?.valueKey && ctx.view?.metadata?.widthData) {
      const _values = _validNumericalValues(ctx.view.metadata.widthData.values)
      if (_values.length > 0) {
        legends.push({
          type: 'ProportionalSymbolLegend',
          unit: viewSpec.measure_unit,
          title: viewSpec.label,
          min: Math.min(..._values),
          max: Math.max(..._values),
          sizeMin: WIDTH_MIN * 4,
          sizeMax: WIDTH_MAX * 4,
          numberFormat: viewSpec.style?.lineWidth?.numberFormat || [
            'pt-BR',
            { maximumFractionDigits: 0 },
          ],
        })
      }
    }

    return legends
  })
}

function _main_line(
  { _maplibreLineWidthExp, _maplibreColorExp },
  viewSpec,
  allViewSpecs,
  context,
) {
  const { source_layer } = viewSpec

  const _opacity = resolve.fn((ctx) =>
    typeof ctx.view?.conf?.style?.opacity === 'number'
      ? ctx.view.conf.style.opacity
      : DEFAULT_LINE_OPACITY,
  )

  const line = resolve.fn((ctx) => {
    return {
      zIndex: Z_OVERLAY_BASE_1000,
      source: 'main',
      'source-layer': source_layer,
      type: 'line',
      paint: {
        'line-color': _maplibreColorExp,
        'line-opacity': _opacity,
        'line-width': _maplibreLineWidthExp,
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

  const _maplibreLineWidthExp = resolve.fn((ctx) => {
    if (
      styleSpec?.lineWidth?.valueKey &&
      ctx.view?.metadata?.widthData?.widthScaleStops
    ) {
      return [
        'step',
        ['coalesce', ['get', styleSpec.lineWidth.valueKey], WIDTH_MIN],
        ...ctx.view.metadata.widthData.widthScaleStops,
      ]
    } else {
      return (
        ctx.view?.conf?.style?.lineWidth || styleSpec?.lineWidth || LINE_WIDTH_1
      )
    }
  })

  const _maplibreColorExp = resolve.fn((ctx) => {
    const colors = ctx.view?.metadata?.widthData?.colors
    if (!colors?.length) {
      return NO_DATA_COLOR
    }

    return [
      'match',
      ['get', 'id'],
      ...colors.flatMap((item) => [item.id, resolveColor(item.color)]),
      NO_DATA_COLOR,
    ]
  })

  return {
    [`main_line`]: _main_line(
      { _maplibreLineWidthExp, _maplibreColorExp },
      viewSpec,
      allViewSpecs,
      context,
    ),
  }
}
