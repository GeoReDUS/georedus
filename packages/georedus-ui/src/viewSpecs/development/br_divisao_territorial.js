function br_divisao_territorial({
  VECTOR_TILE_SERVER_ENDPOINT,
  id,
  label = id,
  year,
  paint,
}) {
  VECTOR_TILE_SERVER_ENDPOINT = 'http://localhost:8002'

  return {
    collection_id: 'br_divisao_territorial',
    indicator_id: id,
    id: id,
    label,
    path: `Divisão política / ${year} / ${label}`,
    metadata: {},

    sources: {
      [id]: {
        type: 'vector',
        tiles: [`${VECTOR_TILE_SERVER_ENDPOINT}/${id}/{z}/{x}/{y}`],
      },
    },
    layers: {
      [`${id}_bounds`]: {
        source: id,
        'source-layer': id,
        type: 'line',
        paint: paint,
      },
    },
  }
}

export function br_divisao_territorial_views(conf) {
  return [
    //
    // 2024
    //
    br_divisao_territorial({
      ...conf,
      year: '2022',
      label: 'Municípios',
      id: 'ibge_malha_br_municipio_2024.geom',
      paint: {
        'line-color': 'green',
        'line-width': 10,
        'line-opacity': 0.5,
      },
    }),

    //
    // Censo 2022
    //
    br_divisao_territorial({
      id: 'ibge_malha_br_distrito_2022.geom',
      year: '2022',
      label: 'Distritos',
      paint: {
        'line-color': 'blue',
        'line-width': 6,
        'line-opacity': 0.5,
      },
      ...conf,
    }),
    br_divisao_territorial({
      ...conf,
      year: '2022',
      label: 'Subdistritos',
      id: 'ibge_malha_br_subdistrito_2022.geom',
      paint: {
        'line-color': 'magenta',
        'line-width': 2,
        'line-opacity': 0.5,
      },
    }),
    br_divisao_territorial({
      ...conf,
      year: '2022',
      label: 'Bairros',
      id: 'ibge_malha_br_bairro_2022.geom',
      paint: {
        'line-color': 'black',
        'line-width': 1,
        'line-opacity': 0.5,
      },
    }),
    br_divisao_territorial({
      year: '2022',
      label: 'Favelas e Comunidades Urbanas',
      id: 'ibge_malha_br_fcu_2022.geom',
      paint: {
        'line-color': 'gold',
        'line-width': 1,
        'line-opacity': 1,
      },
      ...conf,
    }),

    //
    // Censo 2010
    //
    br_divisao_territorial({
      year: '2010',
      label: 'Distritos',
      id: 'ibge_malha_br_distrito_2010.geom',
      paint: {
        'line-color': 'blue',
        'line-width': 6,
        'line-opacity': 0.5,
      },
      ...conf,
    }),
    br_divisao_territorial({
      year: '2010',
      label: 'Subdistritos',
      id: 'ibge_malha_br_subdistrito_2010.geom',
      paint: {
        'line-color': 'magenta',
        'line-width': 2,
        'line-opacity': 0.5,
      },
      ...conf,
    }),
  ]
}
