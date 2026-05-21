import { D3_COLOR_SCHEMES } from './d3'
import { GEOREDUS_COLOR_SCHEMES } from './georedus'

import { get } from '@orioro/get'

export const COLOR_SCHEMES = {
  ...D3_COLOR_SCHEMES,
  ...GEOREDUS_COLOR_SCHEMES,
}

export function colorScheme(path: string) {
  const scheme = get(D3_COLOR_SCHEMES, path)

  if (!scheme) {
    throw new Error(`Could not find scheme at ${path}`)
  }

  return scheme
}

export function resolveColor(colorInput: string): string {
  return colorInput
    ? get(D3_COLOR_SCHEMES, colorInput) || colorInput
    : colorInput
}

export * from './d3'
export * from './georedus'
