import { get } from '@orioro/get'
import { $urlSearch } from '../../../../../../resolveView/customExpr'
import { vtx } from '../../../../../../../vtxProtocol'
import { scaleQuantile } from 'd3-scale'

import { _censoColorScheme } from './util'

//
// TODO: restructure and move into maplibre util with naturalBreaks
// Maybe move into separate lib?
function _salarioMinimoBreakpoints({
  salarioMinimo,
  scalesByK,
  defaultColor = '#efefef',
}) {
  // Define as faixas em múltiplos de salário mínimo
  const breaks = [
    { value: salarioMinimo * 0.5, label: '1/2 SM' },
    { value: salarioMinimo * 1, label: '1 SM' },
    { value: salarioMinimo * 2, label: '2 SM' },
    { value: salarioMinimo * 5, label: '5 SM' },
    { value: salarioMinimo * 10, label: '10 SM' },
  ]

  const k = 6  // 6 categorias
  const colorScale = scalesByK[k]
  const colorScaleStops = breaks
    .map(({ value: breakValue }, index) => {
      const color = colorScale[index + 1]

      return index === 0
        ? [
            // Para valores abaixo de 0.5 SM, usa defaultColor
            defaultColor,
            0,
            colorScale[0],
            breakValue,  // Retorna valor numérico para MapLibre
            color,
          ]
        : [breakValue, color]  // Retorna valor numérico para MapLibre
    })
    .flat(1)

  // Armazena os labels para uso na legenda
  colorScaleStops._smLabels = breaks.map(b => b.label)

  return colorScaleStops
}

function _quantileBreakpoints({
  k,
  values,
  scalesByK,
  defaultColor = '#efefef',
}) {
  const scale = scaleQuantile()
    .domain(values) // your data
    .range(new Array(k).fill(null).map((_, idx) => idx)) // number of bins

  const breaks = scale.quantiles() // → the cutoff values

  //
  // Will produce an array such as:
  // [
  //   "below_10",
  //   10,
  //   "between_10_20",
  //   20,
  //   "between_20_30",
  //   30,
  //   "above_30"
  // ]
  //

  const colorScale = scalesByK[k]
  const colorScaleStops = breaks
    .map((breakValue, index) => {
      const color = colorScale[index + 1]

      return index === 0
        ? [
            // For below 0 values, will use defaultColor
            defaultColor,
            0,
            // colorScale
            colorScale[0],
            breakValue,
            color,
          ]
        : [breakValue, color]
    })
    .flat(1)

  return colorScaleStops
}

export async function defaultMetadata(
  { GLOBAL_CONTEXT, PARSED_SCHEMA },
  context,
) {
  const { METADATA_API_ENDPOINT } = GLOBAL_CONTEXT

  // Load data on the municipio
  const municipioId = context.app.municipioId

  const variableId = get(context, 'view.conf.data.variableId')
  const variant = PARSED_SCHEMA.variantsByVariableId[variableId]

  //
  // The rawDataCacheUrl should be shared with following pipeline steps
  // so that it may be effectively cached
  //
  const rawDataCacheUrl = `${METADATA_API_ENDPOINT}/${variant.source_table_id}?${$urlSearch(
    [
      {
        select: ['id', 'cd_mun', variableId, `${variableId}_src`].join(','),
        cd_mun: `eq.${municipioId}`,
      },
    ],
  )}`
  //
  // Explicitly call vtx.memoFetchData, so that cache is persisted
  //
  const rawData = await vtx.memoFetchData(rawDataCacheUrl)
  const scaleValues = get(rawData, `[].${variableId}`)

  const colorScheme = _censoColorScheme(variant.colorScheme)

  // Parse salario-minimo(valor) pattern
  const salarioMinimoMatch = variant.classificationMethod?.match(
    /salario-minimo\((\d+(?:\.\d+)?)\)/
  )
  const salarioMinimo = salarioMinimoMatch
    ? parseFloat(salarioMinimoMatch[1])
    : null

  const colorScaleStops =
    variant.classificationMethod === 'quantile(5)'
      ? _quantileBreakpoints({
          k: 5,
          values: scaleValues,
          ...colorScheme,
        })
      : salarioMinimo !== null
      ? _salarioMinimoBreakpoints({
          salarioMinimo,
          ...colorScheme,
        })
      : [
          '$naturalBreaks',
          scaleValues,
          {
            ...colorScheme,
            minK: 5,
          },
        ]

  return {
    //
    // Review if this is actually needed, as now we are loading
    // data per tile
    //
    //
    labels: PARSED_SCHEMA.labels,
    measureUnits: PARSED_SCHEMA.measureUnits,
    rawDataCacheUrl,
    rawData,
    colorScheme,
    colorScaleStops,
    salarioMinimo,  // Retorna o valor do SM para ser usado na legenda
  }
}

