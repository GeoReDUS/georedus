import { DEFAULT_LINE_OPACITY } from "./consts"

type ClassificationMethod =
  | { type: 'naturalBreaks'; k: number }
  | 'naturalBreaks'
  | { type: 'quantile'; k: number }
  | 'quantile'
  | { type: 'equalIntervals'; k: number }
  | 'equalIntervals'
  // | { type: 'custom'; breaks: number[] }

type ContinuousSpecBase = {
  valueKey: string
  viewKey: string
  cd_mun: string
  // values: string | number[] | { value: number }[]
  classificationMethod?: ClassificationMethod
  // numberFormat?: any
  // to be implemented:
  // legend?: {
  //   format: { [key: string]: any }
  // }
}

export type StyleSpec = {
  colorKey?: string
  opacity?: number
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
    opacity: DEFAULT_LINE_OPACITY,
    ...styleInput,
  }
}
