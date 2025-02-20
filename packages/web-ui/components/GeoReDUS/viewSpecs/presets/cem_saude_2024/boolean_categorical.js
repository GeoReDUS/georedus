import { categorical } from './categorical'

export function boolean_categorical(base, config) {
  return categorical(base, {
    ...config,
    //
    // Set default categories
    //
    categories: config.categories || [
      {
        color: 'schemeSet1.colors[2]',
        label: 'Sim',
        value: 'true',
      },
      {
        color: 'schemeSet1.colors[0]',
        label: 'Não',
        value: 'false',
      },
    ],
  })
}
