export const GEOREDUS_LABELED_SAFE_COLORS = {
  laranja: { label: 'Laranja', value: '#FF7F00' },
  lilas: { label: 'Lilás', value: '#CAB2D6' },
  amarelo: { label: 'Amarelo', value: '#FFE551' },
  verde_agua: { label: 'Verde-água', value: '#39BBA7' },
  vermelho_claro: { label: 'Vermelho claro', value: '#FB9A99' },
  marrom: { label: 'Marrom', value: '#B15928' },
  laranja_claro: { label: 'Laranja claro', value: '#FDBF6F' },
  rosa: { label: 'Rosa', value: '#DA5AD8' },
  verde_marrom: { label: 'Verde-marrom', value: '#B4B282' },
  roxo: { label: 'Roxo', value: '#6A3D9A' },
}

export const GEOREDUS_LABELED_RESTRICTED_USE_COLORS = {
  azul_claro: { label: 'Azul claro', value: '#A6CEE3' },
  azul: { label: 'Azul', value: '#1F78B4' },
  verde_claro: { label: 'Verde claro', value: '#B2DF8A' },
  verde: { label: 'Verde', value: '#33A02C' },
  vermelho: { label: 'Vermelho', value: '#E31A1C' },
  cinza_claro: { label: 'Cinza claro', value: '#CCCCCC' },
  cinza: { label: 'Cinza', value: '#828282' },
}

export const GEOREDUS_LABELED_COLORS = {
  ...GEOREDUS_LABELED_SAFE_COLORS,
  ...GEOREDUS_LABELED_RESTRICTED_USE_COLORS,
}

export const schemeGeoReDUS = Object.fromEntries(
  Object.entries(GEOREDUS_LABELED_COLORS).map(([key, { value }]) => [
    key,
    value,
  ]),
)

export const schemeGeoReDUSSafe = Object.fromEntries(
  Object.entries(GEOREDUS_LABELED_SAFE_COLORS).map(([key, { value }]) => [
    key,
    value,
  ]),
)

export const GEOREDUS_COLOR_SCHEMES = {
  schemeGeoReDUS,
  schemeGeoReDUSSafe,
}
