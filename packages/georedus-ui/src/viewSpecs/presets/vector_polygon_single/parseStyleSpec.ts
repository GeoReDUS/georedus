import { resolveColor, schemeGeoReDUS } from '../../util'
import { DEFAULT_FILL_OPACITY } from '../util'

export type StyleSpec = {
  color?: string
  fillPattern?:
    | 'circles_1'
    | 'cross_1'
    | 'diamonds_1'
    | 'lines_1'
    | 'mosaic_1'
    | 'mosaic_2'
    | 'squares_1'
    | 'triangles_1'
    | 'waves_1'
    | 'solid'
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none'
  opacity?: number
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
    return {
      opacity: DEFAULT_FILL_OPACITY,
      ...styleInput,
      color: _defaultColor(styleInput.color),
    }
  }
}
