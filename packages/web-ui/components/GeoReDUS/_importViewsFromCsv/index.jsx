import { CANCELLED, Markdown } from '@orioro/react-ui-core'
import { resolveData } from '@orioro/react-csv'

import VALID_VARIABLE_IDS from './VALID_VARIABLE_IDS.json'
import { validate } from '@orioro/util'

export async function importViewsFromCsv(dialogs) {
  const csvData = await dialogs.importCsv({
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
    targetProperties: {
      path: {
        label: 'path',
        type: 'text',
        required: false,
      },
      variable_id: {
        label: 'variable_id',
        type: 'text',
        required: true,
        validate: validate.and([
          (input) => typeof input === 'string',
          [
            (input) => VALID_VARIABLE_IDS.includes(input),
            'ID inválido, variável não existe',
          ],
        ]),
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
      presets: {
        label: 'presets',
        type: 'text',
        required: false,
      },
    },
  })

  if (csvData === CANCELLED) {
    return
  }

  const entries = resolveData(csvData.selected, csvData.columnMap)

  console.log(entries)
}
