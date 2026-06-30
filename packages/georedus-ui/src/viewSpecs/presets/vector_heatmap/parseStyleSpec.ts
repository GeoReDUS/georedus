type HeatmapColor = {
  step: number
  color: string
  label: string
}

export type StyleSpec = {
  weight?: number
  radius?: number
  opacity?: number
  color?: HeatmapColor[]
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

const DEFAULTCOLOR = [
  { step: 0.2, color: 'schemeGeoReDUS.azul_claro', label: 'Baixa' },
  { step: 0.6, color: 'schemeGeoReDUS.laranja_claro', label: 'Média' },
  { step: 1, color: 'schemeGeoReDUS.vermelho', label: 'Alta' },
]

export function parseStyleSpec(styleInput: StyleSpecInput): StyleSpec {
  if (!styleInput) {
    return { color: DEFAULTCOLOR }
  }

  return { color: DEFAULTCOLOR, ...styleInput }
}
