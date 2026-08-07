import { COLOR_SCHEMES } from '../../util'
import { Z_OVERLAY_BASE_1000 } from '../../zIndexes'
import { basicTooltip, DEFAULT_FILL_OPACITY, applyOpacity } from '../util'
import { resolve } from '@orioro/resolve'

import { MAIN_SOURCE_ID } from './sources'
import { filter } from 'lodash'

function _main_line(props, viewSpec, allViewSpecs, context) {
  const { source_layer } = viewSpec
  const { municipioFilter } = props

  //
  // Resolve color scale stops
  //
  const colorScheme = COLOR_SCHEMES[viewSpec.style.colorScheme]

  return {
    zIndex: Z_OVERLAY_BASE_1000,
    source: MAIN_SOURCE_ID,
    'source-layer': source_layer,
    type: 'line',
    interactive: true,
    filter: municipioFilter,
    paint: {
      'line-color': colorScheme.scalesByK[3][2],
      'line-width': 2,
      'line-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        1,
        0,
      ],
    },
  }
}

const DEFAULT_NUMBER_FORMAT = ['pt-BR', {}]

function _main_fill_legends(props, viewSpec, allViewSpecs, context) {
  const _legends = resolve.fn((ctx) => {
    const _confOpacity = ctx.view?.conf?.style?.opacity
    // OBS: stopsWithOpacity foi feito para aplicar na legenda a opacidade que também é aplicada no mapa
    // colorScaleStops retorna um array cuja estrutura é [cor, valor, cor, valor, ..., valor, cor]
    // por isso a opacidade está sendo aplicada somente nos indexes pares
    const stopsWithOpacity = ctx.view.metadata.colorScaleStops.map(
      (entry, index) =>
        index % 2 === 0
          ? applyOpacity(
              entry,
              typeof _confOpacity === 'number'
                ? _confOpacity
                : DEFAULT_FILL_OPACITY,
            )
          : entry,
    )
    return [
      {
        type: 'SequentialColorLegend',
        title: viewSpec.label,
        unit: viewSpec.unit,

        steps: stopsWithOpacity,
        format: {
          number: viewSpec.style.numberFormat || DEFAULT_NUMBER_FORMAT,
          below: 'Sem dados',
          above: 'Acima de ${0}',
          ...(viewSpec.style.legend?.format || {}),
        },
      },
    ]
  })
  return _legends
}

function _main_fill(props, viewSpec, allViewSpecs, context) {
  const { _maplibreColorExp, municipioFilter } = props
  const { source_layer } = viewSpec
  const _opacity = resolve.fn((ctx) =>
    typeof ctx.view?.conf?.style?.opacity === 'number'
      ? ctx.view.conf.style.opacity
      : DEFAULT_FILL_OPACITY,
  )
  return {
    zIndex: Z_OVERLAY_BASE_1000,
    source: MAIN_SOURCE_ID,
    'source-layer': source_layer,
    interactive: true,
    type: 'fill',
    filter: municipioFilter,
    paint: {
      'fill-color': _maplibreColorExp,
      'fill-opacity': _opacity,
    },
    legends: _main_fill_legends(props, viewSpec, allViewSpecs, context),
    tooltip: basicTooltip(viewSpec.tooltip),
  }
}

export function layers(viewSpec, allViewSpecs, context) {
  const styleSpec = viewSpec.style

  const { source_layer, tiles } = viewSpec

  if (!source_layer) {
    throw new Error('source_layer must be defined')
  }

  //
  // The tiles URL may be scoped to a single município via the
  // `${app.municipioId}` placeholder (e.g. `?cd_mun=eq.${app.municipioId}`).
  // Some backends don't honor arbitrary query params on tile
  // requests, so re-apply the same restriction client-side as a
  // safeguard. Presets whose tiles are intentionally nationwide
  // (no `${app.municipioId}` placeholder) are left unfiltered.
  //
  const tilesList = Array.isArray(tiles) ? tiles : [tiles]
  const scopedToMunicipio = tilesList.some(
    (t) => typeof t === 'string' && t.includes('${app.municipioId}'),
  )
  const municipioFilter =
    scopedToMunicipio && context.app?.municipioId
      ? ['==', ['get', 'cd_mun'], context.app.municipioId]
      : true

  const _maplibreColorExp = resolve.fn((ctx) => [
    'step',
    [
      'coalesce',
      ['get', viewSpec.style.valueKey],
      //
      // Just need to coalesce to value lower than the least existing value
      //
      Math.min(...ctx.view.metadata.values) - 1,
    ],
    ...ctx.view.metadata.colorScaleStops,
  ])

  // const _fillPattern = resolve.fn(
  //   (ctx) => ctx.view?.conf?.style?.fillPattern || styleSpec.fillPattern,
  // )

  return {
    [`main_line`]: _main_line(
      { _maplibreColorExp, municipioFilter },
      viewSpec,
      allViewSpecs,
      context,
    ),
    [`main_fill`]: _main_fill(
      { _maplibreColorExp, municipioFilter },
      viewSpec,
      allViewSpecs,
      context,
    ),
  }
}
