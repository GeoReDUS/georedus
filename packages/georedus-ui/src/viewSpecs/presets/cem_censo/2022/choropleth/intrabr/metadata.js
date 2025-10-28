import { resolve, resolveAsync } from '@orioro/resolve'
import { get } from '@orioro/get'
import { $urlSearch } from '../../../../../resolveView/customExpr'
import { COLOR_SCHEMES } from '../../../../../util'
import { vtx } from '../../../../../../vtxProtocol'

const DEFAULT_COLOR_SCHEME = COLOR_SCHEMES.schemeOranges

export function metadata({ GLOBAL_CONTEXT, PARSED_SCHEMA }) {
  const { METADATA_API_ENDPOINT } = GLOBAL_CONTEXT

  return resolveAsync.fn(async (context) => {
    // Load data on the municipio
    const municipioId = context.app.municipioId
    const ufId = municipioId.slice(0, 2)

    const [brData] = await fetch(
      `${METADATA_API_ENDPOINT}/ibge_malha_br_pais_2024?${$urlSearch([
        {
          select: ['bbox', 'name'].join(','),
        },
      ])}`,
    ).then((res) => res.json())

    if (!brData) {
      throw new Error(`BR data not found`)
    }

    const variableId = get(context, 'view.conf.data.variableId')
    const variant = PARSED_SCHEMA.variantsByVariableId[variableId]

    //
    // The rawDataCacheUrl should be shared with following pipeline steps
    // so that it may be effectively cached
    //
    const rawDataCacheUrl = `${METADATA_API_ENDPOINT}/${variant.source_table_id}_agg_cd_mun?${$urlSearch(
      [
        {
          select: ['id', variableId, `${variableId}_src`].join(','),
        },
      ],
    )}`

    //
    // Explicitly call vtx.memoFetchData, so that cache is persisted
    //
    const rawData = await vtx.memoFetchData(rawDataCacheUrl)

    //
    // Use values for the focusMunicipio to build the scale
    //
    const scaleValues = get(rawData, `[].${variableId}`)

    const colorScheme = variant.colorScheme
      ? COLOR_SCHEMES[variant.colorScheme] || DEFAULT_COLOR_SCHEME
      : DEFAULT_COLOR_SCHEME

    return {
      brData,
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
  })
}
