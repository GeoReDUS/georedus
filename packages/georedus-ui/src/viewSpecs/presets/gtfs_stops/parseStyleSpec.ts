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
  values: string | number[] | { value: number }[]
  numberFormat?: any
  classificationMethod?: ClassificationMethod
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
  legend?: {
    format: { [key: string]: number }
  }
}

export type StyleSpec = {
  color?: string
  radius?: ContinuousSpecBase & {}
}

export type StyleSpecInput = StyleSpec

export const DEFAULT_COLOR_SCHEME_ID = 'schemeRdYlGn'

export function parseStyleSpec(styleInput: StyleSpecInput): StyleSpec {
  return {
    ...styleInput,
    radius: styleInput.radius
      ? {
          ...styleInput.radius,
          classificationMethod: !styleInput.radius.classificationMethod
            ? { type: 'naturalBreaks', k: 5 }
            : typeof styleInput.radius.classificationMethod === 'string'
              ? { type: styleInput.radius.classificationMethod, k: 5 }
              : styleInput.radius.classificationMethod,
          colorScheme: styleInput.radius.colorScheme || DEFAULT_COLOR_SCHEME_ID,
        }
      : undefined,
  }
}
