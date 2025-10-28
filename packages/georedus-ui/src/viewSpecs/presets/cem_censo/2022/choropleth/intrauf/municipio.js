import { resolve } from '@orioro/resolve'
import { get } from '@orioro/get'

const MUNICIPIO_SOURCE_ID = 'ibge_malha_br_municipio_2024.geom'

export function municipio_sources({ GLOBAL_CONTEXT, PARSED_SCHEMA }) {
  const { VECTOR_TILE_SERVER_ENDPOINT } = GLOBAL_CONTEXT

  return {
    [MUNICIPIO_SOURCE_ID]: {
      type: 'vector',
      attribution: PARSED_SCHEMA.sourceLabel,
      // minzoom: 6,
      // //
      // // Prevent system from fetching data beyond necessary detail
      // //
      // maxzoom: 10,
      bounds: ['$get', 'view.metadata.ufData.bbox'],
      promoteId: 'id',
      tiles: [
        resolve.fn((context) => {
          const variableId = get(context, 'view.conf.data.variableId')

          return [
            '$vtxUrl',
            {
              tiles: `${VECTOR_TILE_SERVER_ENDPOINT}/${MUNICIPIO_SOURCE_ID}/{z}/{x}/{y}`,
              data: [['id', ['$get', 'view.metadata.rawDataCacheUrl']]],
            },
          ]
        }),
      ],
    },
  }
}

export function municipio_layers() {
  //
  // Fill color expression for data loaded from
  // vector source
  //
  const _vectorSourceFillColor = [
    '$flat',
    [
      [
        'step',
        ['coalesce', ['get', ['$get', 'view.conf.data.variableId']], -1],
      ],
      ['$get', 'view.metadata.colorScaleStops'],
    ],
  ]

  return {
    //
    // Polygon fill from the vector source layer
    // (setor censitario)
    //
    [`${MUNICIPIO_SOURCE_ID}_fill`]: {
      hidden: [
        '$not',
        ['$empty', ['$get', 'view.metadata.customGeoJSON.AREAS']],
      ],
      interactive: true,
      // legends: CHART_UTIL._legends,

      // tooltip: {
      //   title: null,
      //   entries: [CHART_UTIL._variableValueTooltipEntry],
      // },
      source: MUNICIPIO_SOURCE_ID,
      'source-layer': MUNICIPIO_SOURCE_ID,
      type: 'fill',
      // maxzoom: 14,

      filter: [
        'in',
        ['get', 'cd_uf'],
        ['literal', ['$get', 'view.metadata.ufData.cd_uf']],
      ],
      paint: {
        'fill-color': _vectorSourceFillColor,
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          1,
          ['$get', 'view.conf.style.layerOpacity'],
        ],
        'fill-outline-color': 'transparent',
      },
    },
  }
}
