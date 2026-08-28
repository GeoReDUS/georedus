import { Z_OVERLAY_BASE_1000 } from '../../zIndexes'
import { basicTooltip, municipioFilter, applyOpacity } from '../util'
import { resolve } from '@orioro/resolve'

import { MAIN_SOURCE_ID } from './sources'
import {
  GEOREDUS_LABELED_RESTRICTED_USE_COLORS,
  zoomSensitiveLinearSizes,
  COLOR_SCHEMES,
} from '../../util'
import { DEFAULT_COLOR_SCHEME_ID } from './parseStyleSpec'

const SIZE_MAX = 10
const SIZE_MIN = 4

const DEFAULT_CIRCLE_OPACITY = 0.7

function _validNumericalValues(values) {
  return values.filter(
    (value) => typeof value === 'number' && !Number.isNaN(value),
  )
}

const NO_DATA_COLOR = GEOREDUS_LABELED_RESTRICTED_USE_COLORS.cinza_claro.value

function _buildColorStops(colorScaleStops, hasLowerValues, colorScheme) {
  if (!hasLowerValues) {
    return colorScaleStops
  }

  const k = (colorScaleStops.length - 1) / 2
  const colors = colorScheme.scalesByK[k + 1] || colorScheme.scalesByK[colorScheme.maxK]

  const stops = []
  stops.push(colorScaleStops[0]) // DEFAULT_COLOR base
  stops.push(0) // boundary for [0, colors[0]) bucket
  stops.push(colors[0]) // color for that bucket
  stops.push(1) // boundary for [1, colors[1]) bucket (shifted one color up)
  stops.push(colors[1])

  for (let i = 3; i < colorScaleStops.length; i += 2) {
    stops.push(colorScaleStops[i]) // original break boundary
    stops.push(colors[Math.floor(i / 2) + 1]) // shifted color
  }

  return stops
}

function _main_circle_legends(pros, viewSpec, allViewSpecs, context) {
  const _legends = resolve.fn((ctx) => {
    if (!viewSpec.style?.radius?.valueKey || !ctx.view.metadata.radiusData) {
      return []
    }

    const _values = _validNumericalValues(ctx.view.metadata.radiusData.values)
    const min = Math.min(..._values)
    const max = Math.max(..._values)

    const colorSchemeId =
      ctx.view.conf?.style?.colorScheme || viewSpec.style?.radius?.colorScheme
    const colorScheme =
      COLOR_SCHEMES[colorSchemeId] || COLOR_SCHEMES[DEFAULT_COLOR_SCHEME_ID]
    const colors = colorScheme.scalesByK[colorScheme.maxK]

    const { colorScaleStops, hasLowerValues } = ctx.view.metadata.radiusData

    const stopsToUse = _buildColorStops(colorScaleStops, hasLowerValues, colorScheme)

    const stopsWithOpacity = stopsToUse.map(
          (entry, index) =>
            index % 2 === 0
              ? applyOpacity(
                  entry,
                  typeof _confOpacity === 'number'
                    ? _confOpacity
                    : DEFAULT_CIRCLE_OPACITY,
                )
              : Math.round(entry),
        )

    return [
      {
        type: 'ProportionalSymbolLegend',
        unit: viewSpec.measure_unit,
        title: viewSpec.label,
        min,
        max,
        sizeMin: SIZE_MIN * 6,
        sizeMax: SIZE_MAX * 6,
        numberFormat: viewSpec.style?.radius?.numberFormat || [
          'pt-BR',
          { maximumFractionDigits: 0 },
        ],
      },
      {
        type: 'SequentialColorLegend',
        title: null,
        unit: null,
        steps: stopsWithOpacity,
        format: {
          below: 'Sem dados',
          above: 'Acima de ${0}',
          ...(viewSpec.style.legend?.format || {}),
        },
      },
    ]
  })
  return _legends
}

function _main_circle(props, viewSpec, allViewSpecs, context) {
  const { _municipioFilter, _maplibreColorExp } = props
  const { source_layer } = viewSpec

  const _opacity = resolve.fn((ctx) =>
    typeof ctx.view?.conf?.style?.opacity === 'number'
      ? ctx.view.conf.style.opacity
      : DEFAULT_CIRCLE_OPACITY,
  )

  return {
    zIndex: Z_OVERLAY_BASE_1000,
    source: MAIN_SOURCE_ID,
    'source-layer': source_layer,
    interactive: true,
    filter: _municipioFilter,
    type: 'circle',
    paint: {
      'circle-color': _maplibreColorExp,
      'circle-opacity': _opacity,
      // 'circle-radius': 5,
      'circle-radius': resolve.fn((ctx) => {
        if (!viewSpec.style.radius?.valueKey) {
          return 10
        }

        const values = _validNumericalValues(
          ctx.view.metadata.radiusData.values,
        )

        return zoomSensitiveLinearSizes({
          variable: ['get', viewSpec.style?.radius?.valueKey],
          minValue: Math.min(...values),
          maxValue: Math.max(...values),
          minSize: SIZE_MIN,
          maxSize: SIZE_MAX,
        })
      }),
      // 'circle-stroke-color': '#ffffff',
      // 'circle-stroke-width': 1,
    },
    legends: _main_circle_legends(props, viewSpec, allViewSpecs, context),
    tooltip: basicTooltip(viewSpec.tooltip),
  }
}

export function layers(viewSpec, allViewSpecs, context) {
  const { source_layer } = viewSpec

  if (!source_layer) {
    throw new Error('source_layer must be defined')
  }

  const _municipioFilter = municipioFilter()

  const _maplibreColorExp = resolve.fn((ctx) => {
    const { colorScaleStops, hasLowerValues } = ctx.view.metadata.radiusData

    const colorSchemeId =
      ctx.view.conf?.style?.colorScheme || viewSpec.style?.radius?.colorScheme
    const colorScheme =
      COLOR_SCHEMES[colorSchemeId] || COLOR_SCHEMES[DEFAULT_COLOR_SCHEME_ID]

    const stops = _buildColorStops(colorScaleStops, hasLowerValues, colorScheme)

    return [
      'step',
      [
        'coalesce',
        ['get', viewSpec.style.radius.valueKey],
        Math.min(...ctx.view.metadata.radiusData.values) - 1,
      ],
      ...stops,
    ]
  })

  return {
    [`main_circle`]: _main_circle(
      { _municipioFilter, _maplibreColorExp },
      viewSpec,
      allViewSpecs,
      context,
    ),
  }
}
