import { resolveColor, schemeGeoReDUS } from '../../util'

export type StyleSpec = {
  tooltip?: { [key: string]: any }
  radius?: string | number
  color?: string
}

export type StyleSpecInput = StyleSpec

function _defaultColor(inputColor: string | undefined): string {
  return inputColor ? resolveColor(inputColor) : schemeGeoReDUS.laranja
}

export function parseStyleSpec(styleInput: StyleSpecInput): StyleSpec {
  if (!styleInput) {
    return {}
  }

  // console.log('styleInput', styleInput)

  if (typeof styleInput === 'string') {
    return {
      color: _defaultColor(styleInput),
    }
  } else {
    return { ...styleInput, color: _defaultColor(styleInput.color) }
  }
}
