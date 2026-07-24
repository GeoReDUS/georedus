type Category = {
  value: string
  label?: string
  color?: string
}

export type StyleSpec = {
  categoryKey: string
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
    | null
  categories: string | (string | Category)[]
  linePattern?: 'solid' | 'dashed' | 'dotted'
  lineWidth?: number
}

export type StyleSpecInput = StyleSpec

const DEFAULT_COLOR_SCHEME_ID = 'schemeGeoReDUSSafe'

export function parseStyleSpec(styleInput?: StyleSpecInput): StyleSpec {
  if (!styleInput) {
    throw new Error('expected existing styleInput')
  }

  // if categories is array and have prop color,
  // coloScheme is null, otherwise, is default
  const colorScheme =
    Array.isArray(styleInput.categories) &&
    styleInput.categories.every(
      (category) => typeof category !== 'string' && 'color' in category,
    )
      ? null
      : DEFAULT_COLOR_SCHEME_ID

  return { colorScheme, ...styleInput }
}
