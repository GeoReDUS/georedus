import { COLOR_SCHEMES } from '../../../../../../util'

const DEFAULT_COLOR_SCHEME = COLOR_SCHEMES.schemeOranges

export function _censoColorScheme(colorSchemeName) {
  const colorScheme = colorSchemeName
    ? COLOR_SCHEMES[colorSchemeName] || DEFAULT_COLOR_SCHEME
    : DEFAULT_COLOR_SCHEME

  return colorScheme
}
