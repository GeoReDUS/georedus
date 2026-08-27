import { resolve } from '@orioro/resolve'
import { parseStepsToItems } from '@orioro/react-chart-util'
import {
  GEOREDUS_LABELED_RESTRICTED_USE_COLORS,
  resolveColor,
} from '../../util'
import { Z_OVERLAY_BASE_1000 } from '../../zIndexes'
import { basicTooltip, LINE_WIDTH_1, municipioFilter } from '../util'
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
    const overrideColor = ctx.view?.conf?.style?.color
    const legends = []

    if (viewSpec.style?.lineWidth?.valueKey && ctx.view?.metadata?.widthData) {
      const _values = _validNumericalValues(ctx.view.metadata.widthData.values)
      if (_values.length > 0 && ctx.view.metadata.widthData.widthScaleStops) {
        const parsedItems = parseStepsToItems(
          ctx.view.metadata.widthData.widthScaleStops,
          {
            number: viewSpec.style?.lineWidth?.numberFormat || [
              'pt-BR',
              { maximumFractionDigits: 0 },
            ],
          },
          {},
        )
        console.log("parsedItems", parsedItems)
        legends.push({
          type: 'CategoricalLegend',
          title: viewSpec.label,
          items: parsedItems.map((item, index) => ({
            id: index,
            label: item.label,
            box: {
              style: {
                height: 0,
                width: 24,
                borderTopStyle: 'solid',
                borderTopWidth: `${item.color}px`,
                borderColor:
                  overrideColor === 'customColor' ? '#555555' : overrideColor,
              },
            },
          })),
        })
      }
    }

    return legends
  })
}

function _main_line(
  { _maplibreLineWidthExp, _maplibreColorExp, _municipioFilter },
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
      filter: _municipioFilter,
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

  const _municipioFilter = municipioFilter()

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
    const selectedColor = ctx.view?.conf?.style?.color
    return selectedColor === 'customColor'
      ? ['coalesce', ['get', 'color'], NO_DATA_COLOR]
      : resolveColor(selectedColor)
  })

  return {
    [`main_line`]: _main_line(
      { _maplibreLineWidthExp, _maplibreColorExp, _municipioFilter },
      viewSpec,
      allViewSpecs,
      context,
    ),
  }
}
