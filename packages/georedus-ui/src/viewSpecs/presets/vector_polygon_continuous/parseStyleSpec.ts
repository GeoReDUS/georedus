import { DEFAULT_FILL_OPACITY } from "../util";

type ClassificationMethod =
  | { type: 'naturalBreaks'; k: number }
  | 'naturalBreaks'
  | { type: 'quantile'; k: number }
  | 'quantile'
  | { type: 'custom'; breaks: number[] }
// to be implemented:
// | { type: 'continuous' }
// | 'continuous'

export type StyleSpec = {
  valueKey: string
  values: string | number[] | { value: number }[]
  numberFormat?: any
  legend?: {
    format: { [key: string]: any }
  }
  colorScheme?: // sequential
  | 'schemeBlues'
    | 'schemeGreens'
    | 'schemeGreys'
    | 'schemeOranges'
    | 'schemePurples'
    | 'schemeReds'
    | 'schemeBuGn'
    | 'schemeBuPu'
    | 'schemeGnBu'
    | 'schemeOrRd'
    | 'schemePuBuGn'
    | 'schemePuBu'
    | 'schemePuRd'
    | 'schemeRdPu'
    | 'schemeYlGnBu'
    | 'schemeYlGn'
    | 'schemeYlOrBr'
    | 'schemeYlOrRd'

    // diverging:
    | 'schemeBrBG'
    | 'schemePRGn'
    | 'schemePiYG'
    | 'schemePuOr'
    | 'schemeRdBu'
    | 'schemeRdGy'
    | 'schemeRdYlBu'
    | 'schemeRdYlGn'
    | 'schemeSpectral'

    // custom
    | string[]

  classificationMethod?: ClassificationMethod
  opacity?: number
}

export type StyleSpecInput = StyleSpec

export const DEFAULT_COLOR_SCHEME_ID = 'schemeOrRd'

export function parseStyleSpec(styleInput: StyleSpecInput): StyleSpec {
  return {
    colorScheme: DEFAULT_COLOR_SCHEME_ID,
    opacity: DEFAULT_FILL_OPACITY,
    ...styleInput,
    classificationMethod: !styleInput.classificationMethod
      ? { type: 'naturalBreaks', k: 5 }
      : typeof styleInput.classificationMethod === 'string'
        ? { type: styleInput.classificationMethod, k: 5 }
        : styleInput.classificationMethod,
  }
}
