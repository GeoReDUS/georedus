import { resolve } from '@orioro/resolve'
import { get } from '@orioro/get'
import { BUILDINGS_MIN_ZOOM } from './buildings'

const SETOR_CENSITARIO_SOURCE_ID = 'ibge_malha_br_setor_censitario_2022.geom'

const NUMBER_FMT = [
  '$if',
  ['$endsWith', ['$get', 'view.conf.data.variableId'], '_pct'],
  ['pt-BR', { style: 'percent' }],
  ['pt-BR', {}],
]

export const INSUFFICIENT_DATA_COLOR = 'red'

export function setor_censitario_legends({ PARSED_SCHEMA }) {
  return [
    {
      type: 'SequentialColorLegend',
      title: [
        '$get',
        ['$get', 'view.conf.data.variableId'],
        ['$get', 'view.metadata.labels'],
      ],
      unit: [
        '$get',
        ['$get', 'view.conf.data.variableId'],
        ['$get', 'view.metadata.measureUnits'],
      ],

      steps: [
        '$coalesce',
        ['$get', 'view.metadata.colorScaleStops'],
        [
          'transparent',
          ['$min', ['$get', 'view.metadata.variableValues']],
          INSUFFICIENT_DATA_COLOR,
          ['$max', ['$get', 'view.metadata.variableValues']],
        ],
      ],
      format: {
        number: NUMBER_FMT || ['pt-BR', {}],
        below: 'Sem dados',
        above: [
          '$if',
          ['$empty', ['$get', 'view.metadata.colorScaleStops']],
          null,
          'Acima de ${0}',
        ],
      },

      //
      // TODO: review! Clearly not structured manner.
      // Currently used @ GeoReDUS/GeoReDUS.jsx
      //
      __filterFeaturesForStep: (stepInfo, features) => {
        return features.filter((feature) => {
          const value = feature.properties?.[PARSED_SCHEMA.variable_id]

          return (
            typeof value === 'number' &&
            value >= stepInfo.min &&
            (value <= stepInfo.max || stepInfo.max === null)
          )
        })
      },

      // format: {
      //   number: NUMBER_FMT,
      //   below: 'Sem dados',
      // },
      // steps: ['$get', 'view.metadata.colorScaleStops'],
    },
  ]
}

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

export function setor_censitario_layers(opts) {
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
      legends: setor_censitario_legends(opts),

      tooltip: {
        title: null,
        entries: [
          [
            [
              '$get',
              ['$get', 'view.conf.data.variableId'],
              ['$get', 'view.metadata.labels'],
            ],
            [
              '$literal',
              [
                '$fmt',
                [
                  '$get',
                  'feature.properties.value',
                  // [
                  //   '$template',
                  //   'feature.properties.${0}',
                  //   // `::string({ "number": ${JSON.stringify(NUMBER_FMT)} })`,
                  //   ['$get', 'view.conf.data.variableId'],
                  // ],
                ],
                { number: NUMBER_FMT },
              ],
            ],
          ],
          ...[
            'v0001',
            'v0002',
            'v0003',
            'v0004',
            'v0005',
            'v0006',
            'v0007',
          ].map((v) => [
            v,

            [
              '$literal',
              [
                '$get',
                `feature.properties.${v}`,
                // [
                //   '$template',
                //   'feature.properties.${0}',
                //   // `::string({ "number": ${JSON.stringify(NUMBER_FMT)} })`,
                //   ['$get', 'view.conf.data.variableId'],
                // ],
              ],
            ],
          ]),
          [
            'Variáveis originais',
            [
              '$literal',
              [
                '$get',
                'feature.properties.value_src',
                // [
                //   '$template',
                //   'feature.properties.${0}',
                //   // `::string({ "number": ${JSON.stringify(NUMBER_FMT)} })`,
                //   ['$get', 'view.conf.data.variableId'],
                // ],
              ],
            ],
          ],
        ],
        // entries: [CHART_UTIL._variableValueTooltipEntry],
      },
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
      filter: resolve.fn(({ app }) => {
        return [
          'all',
          //
          // cd_situacao = '9' -> Massas de água,
          // Não possui população nem domicílios
          //
          ['!', ['in', ['get', 'cd_situacao'], ['literal', ['9']]]],

          //
          // If regional is not active, only show data
          // on the municipio
          //
          app.regional ? null : ['==', ['get', 'cd_mun'], app.municipioId],

          // 
          // Not all values from basico are empty.
          // TODO: move to backend
          // 
          [
            '!',
            [
              'all',
              ['==', ['get', 'v0001'], 0],
              ['==', ['get', 'v0002'], 0],
              ['==', ['get', 'v0003'], 0],
              ['==', ['get', 'v0004'], 0],
              ['==', ['get', 'v0005'], 0],
              ['==', ['get', 'v0006'], 0],
              ['==', ['get', 'v0007'], 0],
            ],
          ],
        ].filter(Boolean)
      }),
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
