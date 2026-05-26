import { resolveColor, schemeGeoReDUS } from '../../util'

export type StyleSpec = {
  tooltip?: { [key: string]: any }
  radius?: number
  color?: string
  opacity?: number
  border?: boolean
}

export type StyleSpecInput = StyleSpec

function _defaultColor(inputColor: string | undefined): string {
  return inputColor ? resolveColor(inputColor) : schemeGeoReDUS.laranja
}

export function parseStyleSpec(styleInput: StyleSpecInput): StyleSpec {
  if (!styleInput) {
    return {}
  }

  if (typeof styleInput === 'string') {
    return {
      color: _defaultColor(styleInput),
      border: true
    }
  } else {
    return { border: true, ...styleInput, color: _defaultColor(styleInput.color) }
  }
}
