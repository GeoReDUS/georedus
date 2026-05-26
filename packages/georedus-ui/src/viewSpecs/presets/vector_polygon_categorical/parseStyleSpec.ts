export type CategoryStyleSpec = {
  color?: string
  fillPattern?:
    | 'circles_1'
    | 'cross_1'
    | 'diamonds_1'
    | 'lines_1'
    | 'mosaic_1'
    | 'mosaic_2'
    | 'squares_1'
    | 'triangles_1'
    | 'waves_1'
    | 'solid'
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none'
}

type Category = CategoryStyleSpec & {
  value: string
  label?: string
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
  categories: string | (string | Category)[]
} & Omit<CategoryStyleSpec, 'color'>

export type StyleSpecInput = StyleSpec

const DEFAULT_COLOR_SCHEME_ID = 'schemeGeoReDUSSafe'

export function parseStyleSpec(styleInput: StyleSpecInput): StyleSpec {
  if (!styleInput) {
    throw new Error('expected existing styleInput')
  }

  return { colorScheme: DEFAULT_COLOR_SCHEME_ID, ...styleInput }
}
