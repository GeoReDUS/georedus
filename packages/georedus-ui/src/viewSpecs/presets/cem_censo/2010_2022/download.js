import { resolve } from '@orioro/resolve'
import { dataJoin } from '@orioro/util'

import { downloadResolver } from '../../../util'
import { resolveExprAsync } from '../../../resolveView/resolveExpr'

export function download(viewSpec, allViewSpecs, context, { PARSED_SCHEMA }) {
  return downloadResolver({
    fileNameBase: [
      '$template',
      '${0}_${1}_georedus_censo_${2}',
      [['$get', 'view.conf.data.variableId'], ['$get', 'municipioId'], PARSED_SCHEMA.year],
    ],
    mainVariableId: ['$get', 'view.conf.data.variableId'],
    availableVariableIds: [],

    // availableVariableIds: [variable_id, 'str_nome_fantasia', 'id_cnes'],
    fetchData: resolve.fn((context) => async ({ variableIds, options }) => {
      const data = await resolveExprAsync(
        [
          '$fetch',
          [
            '$template',
            `${METADATA_API_ENDPOINT}` +
              '/${source_table_id}?select=' +
              '${variableId},' +
              'cd_setor' +
              '&cd_mun=eq.' +
              '${municipioId}',
            {
              variableId: ['$get', 'view.conf.data.variableId'],
              municipioId: ['$context', 'municipioId'],
              source_table_id: [
                '$get',
                [
                  '$template',
                  '${0}.source_table_id',
                  ['$get', 'view.conf.data.variableId'],
                ],
                PARSED_SCHEMA.variantsByVariableId,
              ],
            },
          ],
        ],
        context,
      )

      const geometries = await resolveExprAsync(
        [
          '$fetch',
          [
            '$template',
            `${METADATA_API_ENDPOINT}` +
              '/${collection_id}?select=geom,cd_setor' +
              '&cd_mun=eq.' +
              '${municipioId}',
            {
              municipioId: ['$context', 'municipioId'],
              collection_id: [
                '$get',
                [
                  '$template',
                  '${0}.collection_id',
                  ['$get', 'view.conf.data.variableId'],
                ],
                PARSED_SCHEMA.variantsByVariableId,
              ],
            },
          ],
        ],
        context,
      )

      return dataJoin([geometries, data], {
        key: 'cd_setor',
      })
    }),
  })
}
