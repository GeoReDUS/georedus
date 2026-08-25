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
  classificationMethod?: ClassificationMethod
  // numberFormat?: any
  // to be implemented:
  // legend?: {
  //   format: { [key: string]: any }
  // }
}

export type StyleSpec = {
  colorKey?: string
  lineWidth?: number | ContinuousSpecBase

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
