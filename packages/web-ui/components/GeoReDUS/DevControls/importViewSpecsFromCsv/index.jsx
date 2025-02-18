import { CANCELLED, Markdown } from '@orioro/react-ui-core'
import { resolveData } from '@orioro/react-csv'

import { validate } from '@orioro/util'

import ibge_malha_br_setor_censitario_2010 from './schemas/ibge_malha_br_setor_censitario_2010.json'
import ibge_malha_br_setor_censitario_2022 from './schemas/ibge_malha_br_setor_censitario_2022.json'
import { merge } from 'lodash'

export const COLLECTION_SCHEMAS = {
  ibge_malha_br_setor_censitario_2010,
  ibge_malha_br_setor_censitario_2022,
}

function variableIdValidator(schema) {
  return validate.and([
    (input) => typeof input === 'string',
    [
      (input) => schema.variable_ids.includes(input),
      'ID inválido, variável não existe',
    ],
  ])
}

const OVERRIDES_BY_COLLECTION = {
  ibge_malha_br_setor_censitario_2010: {
    variable_id: {
      validate: variableIdValidator(
        COLLECTION_SCHEMAS.ibge_malha_br_setor_censitario_2010,
      ),
    },
  },
  ibge_malha_br_setor_censitario_2022: {
    variable_id: {
      validate: variableIdValidator(
        COLLECTION_SCHEMAS.ibge_malha_br_setor_censitario_2022,
      ),
    },
  },
}

export async function importViewSpecsFromCsv(dialogs) {
  const collection_id = await dialogs.options([
    {
      value: 'ibge_malha_br_setor_censitario_2010',
      label: 'Censo 2010',
    },
    {
      value: 'ibge_malha_br_setor_censitario_2022',
      label: 'Censo 2022',
    },
  ])

  if (collection_id === CANCELLED) {
    return CANCELLED
  }

  const csvData = await dialogs.importCsv({
    title: 'Importar visualizações',
    maxLength: 1000,
    // message: (
    //   <Markdown
    //     children={
    //       'Sua planilha deverá conter cabeçalho e as seguintes colunas:\n\n' +
    //       '- Código IBGE\n' +
    //       '- Nome\n' +
    //       '- Email\n' +
    //       '- Organização\n' +
    //       '- Cargo'
    //     }
    //   />
    // ),
    targetProperties: merge(
      {
        collection_id: {
          label: 'collection_id',
          type: 'text',
          required: true,
        },
        preset: {
          label: 'preset',
          type: 'text',
          required: true,
        },
        indicator_path: {
          label: 'indicator_path',
          type: 'text',
          required: false,
        },
        indicator_id: {
          label: 'indicator_id',
          required: true,
        },
        variable_id: {
          label: 'variable_id',
          type: 'text',
          required: true,
        },
        indicator_label: {
          label: 'indicator_label',
          type: 'text',
          required: true,
        },
        variant_path: {
          label: 'variant_path',
          type: 'text',
          required: false,
        },
        variant_label: {
          label: 'variant_label',
          type: 'text',
          required: false,
        },
        measure_unit: {
          label: 'measure_unit',
          type: 'text',
          required: false,
        },
        description: {
          label: 'description',
          type: 'text',
          required: false,
        },
      },
      OVERRIDES_BY_COLLECTION[collection_id],
    ),
  })

  if (csvData === CANCELLED) {
    return CANCELLED
  }

  const entries = resolveData(csvData.selected, csvData.columnMap)

  return entries
}
