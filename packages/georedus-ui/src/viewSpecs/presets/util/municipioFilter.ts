// export function municipioFilter(municipioId: number) {
//   return ['all', ['==', ['get', 'cd_mun'], municipioId]]
// }


import { resolve } from '@orioro/resolve'

export function municipioFilter() {
  return resolve.fn(({ app }) =>
    ['all', app.regional ? null : ['==', ['get', 'cd_mun'], app.municipioId]].filter(Boolean),
  )
}
