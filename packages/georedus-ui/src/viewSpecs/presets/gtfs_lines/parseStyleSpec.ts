import { DEFAULT_LINE_OPACITY } from './consts'

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
  valueLabel: string
  viewKey: string
  cd_mun: string
  // values: string | number[] | { value: number }[]
  classificationMethod?: ClassificationMethod
}

export type StyleSpec = {
  colorKey?: string
  opacity?: number
  lineWidth?: number | ContinuousSpecBase
}

export type StyleSpecInput = StyleSpec

export const DEFAULT_COLOR_SCHEME_ID = 'schemeOrRd'

export function parseStyleSpec(styleInput: StyleSpecInput): StyleSpec {
  return {
    opacity: DEFAULT_LINE_OPACITY,
    ...styleInput,
  }
}
