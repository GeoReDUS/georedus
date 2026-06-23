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
