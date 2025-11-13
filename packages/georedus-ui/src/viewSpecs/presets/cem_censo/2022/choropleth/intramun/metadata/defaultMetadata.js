import { get } from '@orioro/get'
import { $urlSearch } from '../../../../../../resolveView/customExpr'
import { vtx } from '../../../../../../../vtxProtocol'

import { _censoColorScheme } from './util'

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
    colorScaleStops: [
      '$naturalBreaks',
      scaleValues,
      {
        ...colorScheme,
        minK: 5,
      },
    ],
  }
}
