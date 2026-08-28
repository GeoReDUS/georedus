import { CUSTOM_COLOR_SCHEME, DEFAULT_FILL_OPACITY } from '../util'

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
  // fillPattern/borderStyle here are not currently read by layers.jsx —
  // only the top-level style.fillPattern/style.borderStyle apply, shared by all categories
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
    | 'customColorScheme'
  categories: string | (string | Category)[]
  opacity?: number
} & Omit<CategoryStyleSpec, 'color'>

export type StyleSpecInput = StyleSpec

const DEFAULT_COLOR_SCHEME_ID = 'schemeGeoReDUSSafe'

export function parseStyleSpec(styleInput: StyleSpecInput): StyleSpec {
  if (!styleInput) {
    throw new Error('expected existing styleInput')
  }
  const colorScheme =
    Array.isArray(styleInput.categories) &&
    styleInput.categories.every(
      (category) => typeof category !== 'string' && 'color' in category,
    )
      ? CUSTOM_COLOR_SCHEME
      : DEFAULT_COLOR_SCHEME_ID

  return {
    colorScheme,
    opacity: DEFAULT_FILL_OPACITY,
    ...styleInput,
  }
}
