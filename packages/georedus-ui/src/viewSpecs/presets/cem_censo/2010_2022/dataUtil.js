import { resolve } from '@orioro/resolve'
import { get } from '@orioro/get'
import { $urlSearch } from '../../../resolveView/customExpr'

export function dataUtil(viewSpec, allViewSpecs, context, { PARSED_SCHEMA }) {
  const { METADATA_API_ENDPOINT } = context

  const _resolveDataUrl = resolve.fn((context) => {
    const _variableId = get(context, 'view.conf.data.variableId')
    const _variant = PARSED_SCHEMA.variantsByVariableId[_variableId]
    const url = `${METADATA_API_ENDPOINT}/${_variant.source_table_id}?${$urlSearch(
      [
        {
          select: ['cd_setor', _variableId].join(','),
          cd_mun: `eq.${context.app.municipioId}`,
        },
      ],
    )}`

    return url
  })

  return {
    _resolveDataUrl,
  }
}
