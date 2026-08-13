export function municipioFilter(municipioId: number) {
  return ['all', ['==', ['get', 'cd_mun'], municipioId]]
}
