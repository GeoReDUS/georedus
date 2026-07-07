import { resolveColor } from '../../util'
import { LINE_PATTERN_SOLID } from '../util'

export type StyleSpec = {
  color?: string
  linePattern?: 'solid' | 'dashed' | 'dotted' | 'none'
  lineWidth?: number
}

export type StyleSpecInput = string | StyleSpec

function _defaultColor(inputColor: string | undefined): string {
  return inputColor
    ? resolveColor(inputColor)
    : resolveColor('schemeGeoReDUS.laranja')
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
    return {
      ...styleInput,
      color: _defaultColor(styleInput.color),
      linePattern: styleInput.linePattern || LINE_PATTERN_SOLID,
    }
  }
}
