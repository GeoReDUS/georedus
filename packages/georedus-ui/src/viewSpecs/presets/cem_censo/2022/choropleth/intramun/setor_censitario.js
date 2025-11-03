import { resolve } from '@orioro/resolve'
import { get } from '@orioro/get'
import { BUILDINGS_MIN_ZOOM } from './buildings'

const SETOR_CENSITARIO_SOURCE_ID = 'ibge_malha_br_setor_censitario_2022.geom'

export function setor_censitario_sources({ GLOBAL_CONTEXT, PARSED_SCHEMA }) {
  const { VECTOR_TILE_SERVER_ENDPOINT, METADATA_API_ENDPOINT } = GLOBAL_CONTEXT

  return {
    [SETOR_CENSITARIO_SOURCE_ID]: {
      type: 'vector',
      attribution: PARSED_SCHEMA.sourceLabel,
      minzoom: 8,
      //
      // Prevent system from fetching data beyond necessary detail
      //
      maxzoom: BUILDINGS_MIN_ZOOM,
      // bounds: ['$get', 'view.metadata.municipioData.group_bbox'],
      promoteId: 'id',
      tiles: [
        resolve.fn((context) => {
          const variableId = get(context, 'view.conf.data.variableId')
          const variant = PARSED_SCHEMA.variantsByVariableId[variableId]

          console.log('run setor_censitario tiles')

          return [
            '$vtxUrl',
            {
              tiles: `${VECTOR_TILE_SERVER_ENDPOINT}/${SETOR_CENSITARIO_SOURCE_ID}/{z}/{x}/{y}`,
              // data: [['id', ['$get', 'view.metadata.rawDataCacheUrl']]],
              data: [
                [
                  'id',
                  `${METADATA_API_ENDPOINT}/rpc/cem_censo_2022_data_tile?` +
                    `table_id=${variant.source_table_id}&` +
                    `variable_id=${variableId}&` +
                    `z={z}&x={x}&y={y}`,
                ],
              ],
            },
          ]
        }),
      ],
    },
  }
}

export function setor_censitario_layers() {
  //
  // Fill color expression for data loaded from
  // vector source
  //
  const _vectorSourceFillColor = [
    '$flat',
    [
      [
        'step',
        // ['coalesce', ['get', ['$get', 'view.conf.data.variableId']], -1],
        ['coalesce', ['get', 'value'], -1],
      ],
      ['$get', 'view.metadata.colorScaleStops'],
    ],
  ]

  return {
    //
    // Polygon fill from the vector source layer
    // (setor censitario)
    //
    [`${SETOR_CENSITARIO_SOURCE_ID}_fill`]: {
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
      source: SETOR_CENSITARIO_SOURCE_ID,
      'source-layer': SETOR_CENSITARIO_SOURCE_ID,
      type: 'fill',
      // //
      // // Do not render tiles that do not match the focused municipios list
      // //
      // filter: [
      //   'in',
      //   ['get', 'cd_mun'],
      //   ['literal', ['$get', 'view.metadata.municipioData.group_cd_mun_list']],
      // ],
      // maxzoom: 14,
      paint: {
        'fill-color': _vectorSourceFillColor,
        'fill-opacity': [
          'step',
          ['zoom'],
          //
          // At lower zooms, opacities should be high
          //
          [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1,
            ['$get', 'view.conf.style.layerOpacity'],
          ],
          BUILDINGS_MIN_ZOOM,
          //
          // At higher zooms, opacity should be low,
          // so that buildings show up
          //
          ['case', ['boolean', ['feature-state', 'hover'], false], 0.2, 0.1],
        ],
        'fill-outline-color': 'transparent',
      },
    },
  }
}
