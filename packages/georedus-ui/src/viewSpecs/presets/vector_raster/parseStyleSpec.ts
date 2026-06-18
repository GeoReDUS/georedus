import { StyleSpecInput } from '../vector_polygon_categorical/parseStyleSpec'

export type StyleSpec = {
  colorScheme?: //sequential
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
  minValue: string | number
  maxValue: string | number
}

export const DEFAULT_COLOR_SCHEME_ID = 'schemeSpectral'

export function parseStyleSpec(styleInput: StyleSpecInput): StyleSpec {
  return {
    colorScheme: DEFAULT_COLOR_SCHEME_ID,
    ...styleInput,
  }
}
