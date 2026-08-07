import { AppContext } from '../../types'

type Context = {
  app: AppContext
}

//
// The property used to filter by município varies by dataset
// (e.g. `cd_mun`, `municipio_ibge`, ...). Rather than hardcoding
// one name, extract it from the tiles URL's own
// `<property>=eq.${app.municipioId}` query param, since that's
// where each viewSpec already declares which column identifies
// the município for its backend table.
//
const MUNICIPIO_QUERY_PARAM_REGEXP = /([a-zA-Z0-9_]+)=eq\.\$\{app\.municipioId\}/

export function municipioFilter(tiles: string | string[], context: Context) {
  const tilesList = Array.isArray(tiles) ? tiles : [tiles]

  const propertyName = tilesList.reduce<string | null>((found, t) => {
    if (found || typeof t !== 'string') {
      return found
    }
    const match = t.match(MUNICIPIO_QUERY_PARAM_REGEXP)
    return match ? match[1] : found
  }, null)

  if (!propertyName || !context.app?.municipioId) {
    return true
  }

  return [
    'any',
    ['!', ['has', propertyName]],
    [
      '==',
      ['to-string', ['get', propertyName]],
      ['to-string', context.app.municipioId],
    ],
  ]
}
