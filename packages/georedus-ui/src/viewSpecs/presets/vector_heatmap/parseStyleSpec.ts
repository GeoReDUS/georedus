import { resolveColor } from '../../util'
import { DEFAULT_COLOR_SCHEME_ID } from '../util'

type HeatmapSteps = {
  step: number
  label: string
  color?: string
}

export type StyleSpec = {
  weight?: number
  radius?: number
  opacity?: number
  steps?: HeatmapSteps[]
  colorScheme?:
    | 'schemeGeoReDUS'
    // sequential
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
}

export type StyleSpecInput = StyleSpec

const DEFAULTSTEPS = [
  { step: 0.2, label: 'Baixa' },
  { step: 0.6, label: 'Média' },
  { step: 1, label: 'Alta' },
]


export function parseStyleSpec(styleInput: StyleSpecInput): StyleSpec {
  if (!styleInput) {
    return { steps: DEFAULTSTEPS }
  }
  
  // const steps = styleInput.steps?.map((step, index) => ({
  //   ...step,
  //   color: step.color 
  //     ? resolveColor(step.color) || resolveSchemeColor(colorScheme, index)
  //     : resolveSchemeColor(colorScheme, index, steps?.length)
  // }))

  return {
    steps: DEFAULTSTEPS,
    colorScheme: DEFAULT_COLOR_SCHEME_ID,
    ...styleInput,
  }
}
