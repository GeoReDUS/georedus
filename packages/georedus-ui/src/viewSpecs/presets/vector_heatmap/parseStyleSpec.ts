import { resolveColor, COLOR_SCHEMES } from '../../util'

type HeatmapSteps = {
  step: number
  label: string
  color?: string
}

export type StyleSpec = {
  weight?: number
  radius?: number | number[]
  opacity?: number | number[]
  steps?: HeatmapSteps[]
  circle?: Boolean
  circle_radius?: number | number[] 
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

    //sequential reverse:
    | '-schemeBlues'
    | '-schemeGreens'
    | '-schemeGreys'
    | '-schemeOranges'
    | '-schemePurples'
    | '-schemeReds'
    | '-schemeBuGn'
    | '-schemeBuPu'
    | '-schemeGnBu'
    | '-schemeOrRd'
    | '-schemePuBuGn'
    | '-schemePuBu'
    | '-schemePuRd'
    | '-schemeRdPu'
    | '-schemeYlGnBu'
    | '-schemeYlGn'
    | '-schemeYlOrBr'
    | '-schemeYlOrRd'

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

    //diverging reverse:
    | '-schemeBrBG'
    | '-schemePRGn'
    | '-schemePiYG'
    | '-schemePuOr'
    | '-schemeRdBu'
    | '-schemeRdGy'
    | '-schemeRdYlBu'
    | '-schemeRdYlGn'
    | '-schemeSpectral'
}

export type StyleSpecInput = StyleSpec

const DEFAULT_STEPS = [
  { step: 0.2, label: 'Muito Baixa' },
  { step: 0.4, label: 'Baixa' },
  { step: 0.6, label: 'Média' },
  { step: 0.8, label: 'Alta' },
  { step: 1, label: 'Muito Alta' },
]

export const DEFAULT_HEATMAP_COLOR_SCHEME_ID = '-schemeSpectral'

export function parseStyleSpec(styleInput: StyleSpecInput = {}): StyleSpec {
  const steps = styleInput.steps || DEFAULT_STEPS
  const colorSchemeId =
    styleInput.colorScheme || DEFAULT_HEATMAP_COLOR_SCHEME_ID

  return {
    circle: false,
    ...styleInput,
    steps: steps.map((step, index) => ({
      ...step,
      color: step.color
        ? resolveColor(step.color)
        : COLOR_SCHEMES[colorSchemeId].scalesByK[steps.length][index],
    })),
    colorScheme: colorSchemeId,
  }
}
