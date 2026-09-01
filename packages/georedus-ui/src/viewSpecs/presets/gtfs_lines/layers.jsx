import { resolve } from '@orioro/resolve'
import { parseStepsToItems } from '@orioro/react-chart-util'
import {
  GEOREDUS_LABELED_RESTRICTED_USE_COLORS,
  resolveColor,
} from '../../util'
import { Z_OVERLAY_BASE_1000 } from '../../zIndexes'
import { basicTooltip, LINE_WIDTH_1, municipioFilter } from '../util'
import { WIDTH_MIN, WIDTH_MAX, DEFAULT_LINE_OPACITY } from './consts'
import { buildPeriodFrequencyExpression } from '../util/hourUtil'

// In Georedus.jsx unique legend implementation
// legends: uniqBy(
//   views.flatMap((view) => view?.controls?.legends || []),
//   (legend) => legend.dedupeKey || legend.id,
// ),
// In layer legend add dedupeKey
// dedupeKey: `gtfs_lines_lineWidth_${valueKey}_${classificationMethodType}`,

function _validNumericalValues(values) {
  return values.filter(
    (value) => typeof value === 'number' && !Number.isNaN(value),
  )
}

const NO_DATA_COLOR = GEOREDUS_LABELED_RESTRICTED_USE_COLORS.cinza_claro.value

function _main_line_legends(props, viewSpec, allViewSpecs, context) {
  return resolve.fn((ctx) => {
    const legends = []
    const valueKey = viewSpec.style?.lineWidth?.valueKey
    const selectedColor = ctx.view?.conf?.style?.color

    if (valueKey && ctx.view?.metadata?.widthData) {
      const classificationMethodType =
        ctx.view.conf.style?.classificationMethodType ||
        viewSpec.style.lineWidth.classificationMethod?.type ||
        'naturalBreaks'

      const classificationTypeLabel =
        classificationMethodType === 'naturalBreaks'
          ? 'Quebras naturais'
          : classificationMethodType === 'quantile'
            ? 'Quantis'
            : 'Intervalos Iguais'

      const _values = _validNumericalValues(ctx.view.metadata.widthData.values)
      if (_values.length > 0 && ctx.view.metadata.widthData.widthScaleStops) {
        const colors = ctx.view?.metadata?.widthData?.colors || []

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
        legends.push({
          type: 'CategoricalLegend',
          title: `${viewSpec.style.lineWidth.valueLabel} (${classificationTypeLabel})`,
          items: [
            ...(selectedColor === 'customColor'
              ? [
                  {
                    id: 'colors',
                    label: null,
                    box: () => (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'nowrap',
                          width: '100%',
                          height: '20px',
                        }}>
                        {colors.map((color) => (
                          <span
                            key={color}
                            style={{ flex: '1 1 0', backgroundColor: color }}
                          />
                        ))}
                      </div>
                    ),
                  },
                ]
              : []),
            ...parsedItems.map((item, index) => ({
              id: index,
              label: item.label === 'Abaixo de 0' ? 'Sem dados' : item.label,
              box: {
                style: {
                  height: 0,
                  width: 24,
                  borderTopStyle: 'solid',
                  borderTopWidth: `${item.color}px`,
                  borderColor:
                    selectedColor === 'customColor'
                      ? '#555555'
                      : resolveColor(selectedColor),
                },
              },
            })),
          ],
        })
      }
    }

    return legends
  })
}

function _main_line(
  { _maplibreLineWidthExp, _maplibreColorExp, _filter },
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
      filter: _filter,
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

  const _filter = resolve.fn((ctx) => {
    const conditions = [municipioFilter()]

    if (styleSpec?.lineWidth?.valueKey) {
      const [periodFrom, periodTo] = ctx.view.conf?.style?.periodHourSlider || [0, 24]
      conditions.push([
        '!=',
        buildPeriodFrequencyExpression(
          styleSpec.lineWidth.valueKey,
          periodFrom,
          periodTo,
        ),
        0,
      ])
    }

    return ['all', ...conditions]
  })

  const _maplibreLineWidthExp = resolve.fn((ctx) => {
    if (
      styleSpec?.lineWidth?.valueKey &&
      ctx.view?.metadata?.widthData?.widthScaleStops
    ) {
      const [periodFrom, periodTo] = ctx.view.conf?.style?.periodHourSlider || [
        0, 24,
      ]

      return [
        'step',
        [
          'coalesce',
          buildPeriodFrequencyExpression(
            styleSpec.lineWidth.valueKey,
            periodFrom,
            periodTo,
          ),
          WIDTH_MIN,
        ],
        ...ctx.view.metadata.widthData.widthScaleStops,
      ]
    } else {
      return LINE_WIDTH_1
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
      { _maplibreLineWidthExp, _maplibreColorExp, _filter },
      viewSpec,
      allViewSpecs,
      context,
    ),
  }
}
