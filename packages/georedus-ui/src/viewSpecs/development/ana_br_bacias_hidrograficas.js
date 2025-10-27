function _util_bacia({ VECTOR_TILE_SERVER_ENDPOINT, id, label = id, year, paint }) {
  VECTOR_TILE_SERVER_ENDPOINT = 'http://localhost:8002'

  return {
    collection_id: 'ana_br_bacias_hidrograficas',
    indicator_id: id,
    id: id,
    label,
    path: `Bacias Hidrográficas / 2017`,
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

export function ana_br_bacias_hidrograficas(conf) {
  return [
    _util_bacia({
      ...conf,
      year: '2017',
      label: 'Bacias Hidrográficas - Otto 1',
      id: 'ana_malha_br_bacias_hidrograficas_2017_otto_1.geom',
      paint: {
        'line-color': 'blue',
        'line-width': 10,
        'line-opacity': 0.5,
      },
    }),
    _util_bacia({
      ...conf,
      year: '2017',
      label: 'Bacias Hidrográficas - Otto 2',
      id: 'ana_malha_br_bacias_hidrograficas_2017_otto_2.geom',
      paint: {
        'line-color': 'blue',
        'line-width': 10,
        'line-opacity': 0.5,
      },
    }),
    _util_bacia({
      ...conf,
      year: '2017',
      label: 'Bacias Hidrográficas - Otto 3',
      id: 'ana_malha_br_bacias_hidrograficas_2017_otto_3.geom',
      paint: {
        'line-color': 'blue',
        'line-width': 10,
        'line-opacity': 0.5,
      },
    }),
    _util_bacia({
      ...conf,
      year: '2017',
      label: 'Bacias Hidrográficas - Otto 4',
      id: 'ana_malha_br_bacias_hidrograficas_2017_otto_4.geom',
      paint: {
        'line-color': 'blue',
        'line-width': 10,
        'line-opacity': 0.5,
      },
    }),
    _util_bacia({
      ...conf,
      year: '2017',
      label: 'Bacias Hidrográficas - Otto 5',
      id: 'ana_malha_br_bacias_hidrograficas_2017_otto_5.geom',
      paint: {
        'line-color': 'blue',
        'line-width': 10,
        'line-opacity': 0.5,
      },
    }),
    _util_bacia({
      ...conf,
      year: '2017',
      label: 'Bacias Hidrográficas - Otto 6',
      id: 'ana_malha_br_bacias_hidrograficas_2017_otto_6.geom',
      paint: {
        'line-color': 'blue',
        'line-width': 10,
        'line-opacity': 0.5,
      },
    }),
    _util_bacia({
      ...conf,
      year: '2017',
      label: 'Bacias Hidrográficas - Otto 7',
      id: 'ana_malha_br_bacias_hidrograficas_2017_otto_7.geom',
      paint: {
        'line-color': 'blue',
        'line-width': 10,
        'line-opacity': 0.5,
      },
    }),
  ]
}
