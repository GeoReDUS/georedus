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

    const [municipioData] = await fetch(
      `${METADATA_API_ENDPOINT}/ibge_malha_br_municipio_2024?${$urlSearch([
        {
          select: ['cd_mun', 'group_cd_mun_list', 'group_bbox'].join(','),
          cd_mun: `eq.${context.app.municipioId}`,
        },
      ])}`,
    ).then((res) => res.json())

    if (!municipioData) {
      throw new Error(`Municipio not found: ${municipioId}`)
    }

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
          cd_mun: `in.(${(municipioData.group_cd_mun_list || []).join(',')})`,
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
    const scaleValues = get(
      rawData.filter((entry) => entry.cd_mun === municipioId),
      `[].${variableId}`,
    )

    const colorScheme = variant.colorScheme
      ? COLOR_SCHEMES[variant.colorScheme] || DEFAULT_COLOR_SCHEME
      : DEFAULT_COLOR_SCHEME

    return {
      municipioData,
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
