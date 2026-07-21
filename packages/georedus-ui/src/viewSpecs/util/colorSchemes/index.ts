import { D3_COLOR_SCHEMES } from './d3'
import { GEOREDUS_COLOR_SCHEMES } from './georedus'

import { get } from '@orioro/get'

export const COLOR_SCHEMES = {
  ...D3_COLOR_SCHEMES,
  ...GEOREDUS_COLOR_SCHEMES,
}

export function colorScheme(path: string) {
  const scheme = get(COLOR_SCHEMES, path)

  if (!scheme) {
    throw new Error(`Could not find scheme at ${path}`)
  }

  return scheme
}

export function resolveColor(colorInput: string): string {
  return colorInput ? get(COLOR_SCHEMES, colorInput) || colorInput : colorInput
}

export function resolveSchemeColor(
  colorSchemeId: string,
  indexOrId: string | number,
): string {
  const colorScheme = COLOR_SCHEMES[colorSchemeId]

  // return typeof indexOrId === 'string'
  //   ? colorScheme[indexOrId]
  //   : (Array.isArray(colorScheme) ? colorScheme : Object.values(colorScheme))[
  //       indexOrId
  //     ]
  if (typeof indexOrId === 'string') {
    return colorScheme[indexOrId]
  }

  const values = Array.isArray(colorScheme)
    ? colorScheme
    : Array.isArray(colorScheme?.colors)
      ? colorScheme.colors
      : Object.values(colorScheme)

  if (typeof indexOrId === 'number' && indexOrId > values.length - 1) {
    console.warn('Index is higher than colorScheme size: will repeat colors')
  }

  return values[indexOrId % values.length]
}

export * from './d3'
export * from './georedus'
