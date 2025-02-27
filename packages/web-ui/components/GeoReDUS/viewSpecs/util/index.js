import { set } from 'lodash'

export * from './colorSchemes'

export function tableVectorSource(context, tableId, override = {}) {
  const { VECTOR_TILE_SERVER_ENDPOINT } = context
  return {
    type: 'vector',
    tiles: [`${VECTOR_TILE_SERVER_ENDPOINT}/${tableId}.geom/{z}/{x}/{y}`],
    minzoom: 9,
    maxzoom: 20,
    ...override,
  }
}

export function vectorLayer(sourceId, override) {
  return {
    source: sourceId,
    'source-layer': sourceId,
    ...override,
  }
}

export function globalResources(context) {
  const MUNICIPIO_MALHA_TABLE_ID = 'ibge_malha_br_municipio'

  return {
    sources: {
      // planet: {
      //   type: 'vector',
      //   tiles: [
      //     `https://api.maptiler.com/tiles/v3/{z}/{x}/{y}.pbf?key=${context.MAP_TILER_API_KEY}`,
      //   ],
      // },
      global_municipio: tableVectorSource(context, MUNICIPIO_MALHA_TABLE_ID, {
        absoluteId: MUNICIPIO_MALHA_TABLE_ID,
        minzoom: 4,
        maxzoom: 20,
      }),
    },
    layers: {
      municipio: {
        absoluteId: MUNICIPIO_MALHA_TABLE_ID,
        absoluteSourceId: MUNICIPIO_MALHA_TABLE_ID,
        'source-layer': `${MUNICIPIO_MALHA_TABLE_ID}.geom`,
        type: 'line',
        filter: ['==', ['get', 'id'], ['$get', 'municipioId']],
        paint: {
          'line-color': '#000000', // Line color
          'line-width': 4, // Line width
          'line-opacity': 0.5,
          // 'line-dasharray': [2, 4], // Dash pattern
        },
      },

      // landcover: {
      //   zIndex: 9,
      //   // "id": "Landcover",
      //   type: 'fill',
      //   source: 'planet',
      //   'source-layer': 'landcover',
      //   layout: {
      //     visibility: 'visible',
      //   },
      //   paint: {
      //     'fill-antialias': false,
      //     'fill-color': 'hsl(96, 44%, 79%)',
      //     // 'fill-color': 'red',
      //     'fill-opacity': 1,
      //     // 'fill-opacity': {
      //     //   stops: [
      //     //     [8, 0.2],
      //     //     [9, 0.25],
      //     //     [11, 0.35],
      //     //   ],
      //     // },
      //   },
      //   filter: ['in', 'class', 'wood', 'grass'],
      // },
    },
  }
}

//
// https://stackoverflow.com/questions/33713084/download-link-for-google-spreadsheets-csv-export-with-multiple-sheets/33727897#33727897
//
export function googleSheetsUrl({ sheetId, sheetName }) {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`
}

//
// Converts any key with dot notation
// to actual objects
//
export function unflat(obj) {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    set(acc, key, value)

    return acc
  }, {})
}
