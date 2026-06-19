import { resolveColor, schemeGeoReDUS } from '../../util'

export type StyleSpec = {
  color?: string
  linePattern?: 'solid' | 'dashed' | 'dotted' | 'none'
  //fazer width depois
}

export type StyleSpecInput = string | StyleSpec

function _defaultColor(inputColor: string | undefined): string {
  return inputColor ? resolveColor(inputColor) : schemeGeoReDUS.laranja
}

export function parseStyleSpec(styleInput?: StyleSpecInput): StyleSpec {
  if (!styleInput) {
    return {}
  }

  if (typeof styleInput === 'string') {
    return {
      color: _defaultColor(styleInput),
    }
  } else {
    return { ...styleInput, color: _defaultColor(styleInput.color) }
  }
}
