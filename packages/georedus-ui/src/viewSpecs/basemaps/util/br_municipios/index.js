import {Z_OVERLAY_MIDDLE_2000} from '../../../zIndexes'
export const BR_MUNICIPIOS_ID = 'ibge_malha_br_municipio_2024.geom'

export function br_municipios({ api, app }) {
  const { VECTOR_TILE_SERVER_ENDPOINT } = api
  return {
    id: BR_MUNICIPIOS_ID,
    sources: {
      [BR_MUNICIPIOS_ID]: {
        type: 'vector',
        // minzoom: 8,
        minzoom: 6, //TODO: para Altamira
        //
        // Prevent system from fetching data beyond necessary detail
        //
        maxzoom: 10,
        tiles: [
          `${VECTOR_TILE_SERVER_ENDPOINT}/${BR_MUNICIPIOS_ID}/{z}/{x}/{y}`,
        ],
      },
    },
    layers: {
      [`${BR_MUNICIPIOS_ID}_selected_bounds`]: {
        zIndex: Z_OVERLAY_MIDDLE_2000,
        source: BR_MUNICIPIOS_ID,
        'source-layer': BR_MUNICIPIOS_ID,
        type: 'line',
        filter: [
          'all',
          // Matches
          ['==', ['get', 'cd_mun'], app.municipioId || null],
        ],
        paint: {
          // 'line-color': '#888888',
          'line-color': '#353535',
          'line-width': 5,
          'line-opacity': 0.9,
          // 'line-dasharray': [1, 1], // 2px dash, 4px gap
        },
      },
      [`${BR_MUNICIPIOS_ID}_other_bounds`]: {
        source: BR_MUNICIPIOS_ID,
        'source-layer': BR_MUNICIPIOS_ID,
        type: 'line',
        filter: [
          'all',
          // Matches
          ['!', ['==', ['get', 'cd_mun'], app.municipioId || null]],
        ],
        paint: {
          'line-color': '#888888',
          'line-width': 1,
          'line-opacity': 0.5,
        },
      },
    },
  }
}
