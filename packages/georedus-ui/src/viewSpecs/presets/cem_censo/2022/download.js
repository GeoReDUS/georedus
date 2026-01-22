import { resolve } from '@orioro/resolve'
import { dataJoin } from '@orioro/util'

import { downloadResolver } from '../../../util'

export function download(context) {
  const { METADATA_API_ENDPOINT } = context

  return downloadResolver({
    fileNameBase: [
      '$template',
      '${0}_${1}_georedus_censo_${2}',
      [['$get', 'view.conf.data.variableId'], ['$get', 'municipioId'], '2022'],
    ],

    mainVariableId: ['$get', 'view.conf.data.variableId'],
    availableVariableIds: [],

    fetchData: resolve.fn((ctx) => async ({ variableIds, options }) => {
      const variableId = ctx.view.conf.data.variableId

      const dataUrl =
        `${METADATA_API_ENDPOINT}/cem_censo_2022_pessoas?` +
        `cd_mun=eq.${ctx.app.municipioId}&` +
        `select=id,${variableId},${variableId}_src`

      const data = (await fetch(dataUrl).then((res) => res.json())).map(
        (entry) => {
          const newEntry = {
            ...entry,
            ...entry[`${variableId}_src`],
          }
          delete newEntry[`${variableId}_src`]
          return newEntry
        },
      )

      if (options.format === 'CSV') {
        return data
      }

      const geometriesUrl =
        `${METADATA_API_ENDPOINT}/ibge_malha_br_setor_censitario_2022?` +
        `cd_mun=eq.${ctx.app.municipioId}&` +
        `select=id,geom`

      const geometries = await fetch(geometriesUrl).then((res) => res.json())

      return dataJoin([geometries, data], {
        key: 'id',
      })
    }),
  })
}
