import { resolveColor, resolveSchemeColor } from '../../util'

type Category = {
  value: string
  label: string
  color?: string
}

export type StyleSpec = {
  colorScheme?:
    | 'schemeGeoReDUSSafe'
    | 'schemeCategory10'
    | 'schemeAccent'
    | 'schemeDark2'
    | 'schemeObservable10'
    | 'schemePaired'
    | 'schemePastel1'
    | 'schemePastel2'
    | 'schemeSet1'
    | 'schemeSet2'
    | 'schemeSet3'
    | 'schemeTableau10'
    | 'schemeYlOrRd' //added for 'Espraiamento Urbano', is categorical, but need sequential color
  categories: Category[]
  k: number //added for 'Espraiamento Urbano', is categorical, but need sequential color
}

export type StyleSpecInput = StyleSpec

const DEFAULT_COLOR_SCHEME_ID = 'schemeGeoReDUSSafe'

export function parseStyleSpec(styleInput: StyleSpecInput): StyleSpec {
  if (!styleInput) {
    throw new Error('expected existing styleInput')
  }

  const colorScheme = styleInput.colorScheme || DEFAULT_COLOR_SCHEME_ID

  const categories = styleInput.categories.map((category, index) => ({
    ...category,
    color: category.color
      ? resolveColor(category.color) || resolveSchemeColor(colorScheme, index)
      : resolveSchemeColor(colorScheme, index, styleInput.k),
  }))

  return { ...styleInput, colorScheme: DEFAULT_COLOR_SCHEME_ID, categories }
}
