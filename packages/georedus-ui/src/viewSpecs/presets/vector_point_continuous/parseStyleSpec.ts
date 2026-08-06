type ClassificationMethod =
  | { type: 'naturalBreaks'; k: number }
  | 'naturalBreaks'
  | { type: 'quantile'; k: number }
  | 'quantile'
  | { type: 'custom'; breaks: number[] }
// to be implemented:
// | { type: 'continuous' }
// | 'continuous'

type ContinuousSpecBase = {
  valueKey: string
  values: string | number[] | { value: number }[]
  numberFormat?: any
  // to be implemented:
  // classificationMethod?: ClassificationMethod
  // legend?: {
  //   format: { [key: string]: any }
  // }
}

export type StyleSpec = {
  color?: string
  radius?: ContinuousSpecBase & {}
  tooltip?: { [key: string]: any }

  // color?: string | ContinuousSpecBase & {
  //   colorScheme?: // sequential
  //   | 'schemeBlues'
  //     | 'schemeGreens'
  //     | 'schemeGreys'
  //     | 'schemeOranges'
  //     | 'schemePurples'
  //     | 'schemeReds'
  //     | 'schemeBuGn'
  //     | 'schemeBuPu'
  //     | 'schemeGnBu'
  //     | 'schemeOrRd'
  //     | 'schemePuBuGn'
  //     | 'schemePuBu'
  //     | 'schemePuRd'
  //     | 'schemeRdPu'
  //     | 'schemeYlGnBu'
  //     | 'schemeYlGn'
  //     | 'schemeYlOrBr'
  //     | 'schemeYlOrRd'

  //     // diverging:
  //     | 'schemeBrBG'
  //     | 'schemePRGn'
  //     | 'schemePiYG'
  //     | 'schemePuOr'
  //     | 'schemeRdBu'
  //     | 'schemeRdGy'
  //     | 'schemeRdYlBu'
  //     | 'schemeRdYlGn'
  //     | 'schemeSpectral'

  //     // custom
  //     | string[]
  // }
}

export type StyleSpecInput = StyleSpec

export const DEFAULT_COLOR_SCHEME_ID = 'schemeOrRd'

export function parseStyleSpec(styleInput: StyleSpecInput): StyleSpec {
  return {
    ...styleInput,
  }
}
