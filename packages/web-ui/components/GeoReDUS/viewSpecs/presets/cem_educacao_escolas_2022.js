import { schemeRdYlGn } from 'd3-scale-chromatic'
import { METADATA_API_ENDPOINT } from '../constants'
import { globalResources, tableVectorSource, vectorLayer } from '../util'

export function cem_educacao_escolas_2022({ variableId }) {
  const TABLE_ID = 'cem_educacao_escolas_2022'
  const VECTOR_SOURCE_ID = `${TABLE_ID}.geom`
  const VARIABLE_ID = variableId

  const SIZING_VARIABLE_ID = 'qt_mat_fund_ai'

  const globalRes = globalResources()

  const viewId = `${TABLE_ID}.${VARIABLE_ID}`

  return [
    viewId,
    [
      '$let',
      {
        variableValues: [
          '$filter',
          [
            '$get',
            `[].${VARIABLE_ID}`,
            [
              '$fetch',
              [
                '$template',
                `${METADATA_API_ENDPOINT}/${TABLE_ID}?select=${VARIABLE_ID}&co_municipio=eq.\$\{0\}`,
                ['$context', 'municipioId'],
              ],
            ],
          ],
          [
            '$and',
            ['$not', ['$empty', ['$iterator', 'item']]],
            ['$lte', ['$iterator', 'item'], 100],
          ],
        ],
        sizingValues: [
          '$filter',
          [
            '$get',
            `[].${SIZING_VARIABLE_ID}`,
            [
              '$fetch',
              [
                '$template',
                `${METADATA_API_ENDPOINT}/${TABLE_ID}?select=${SIZING_VARIABLE_ID}&co_municipio=eq.\$\{0\}`,
                ['$context', 'municipioId'],
              ],
            ],
          ],
          ['$and', ['$not', ['$empty', ['$iterator', 'item']]]],
        ],
      },
      {
        id: viewId,
        legends: [
          {
            type: 'SequentialColorLegend',
            title: variableId,
            unit: `${variableId}_unit`,
            steps: [
              '$naturalBreaks',
              ['$get', 'variableValues'],
              {
                scalesByK: schemeRdYlGn,
              },
            ],
          },
        ],
        sources: {
          ...globalRes.sources,
          [VECTOR_SOURCE_ID]: tableVectorSource(TABLE_ID, {
            minzoom: 9,
            maxzoom: 20,
          }),
        },
        layers: {
          ...globalRes.layers,
          [`${VECTOR_SOURCE_ID}_circle`]: vectorLayer(VECTOR_SOURCE_ID, {
            type: 'circle',
            interactive: true,
            tooltip: [
              '$literal',
              {
                title: ['$literal', ['$get', 'feature.properties.no_entidade']],
                entries: [
                  [
                    VARIABLE_ID,
                    [
                      '$literal',
                      [
                        '$get',
                        `feature.properties.${VARIABLE_ID}::string({ "number": ["pt-BR"] })`,
                      ],
                    ],
                  ],
                ],
              },
            ],
            filter: [
              'all',
              ['==', ['get', 'co_municipio'], ['$get', 'municipioId']],
              ['==', ['typeof', ['get', VARIABLE_ID]], 'number'],
              // ['<=', ['get', VARIABLE_ID], 100],
            ],
            paint: {
              'circle-opacity': 1,
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['get', SIZING_VARIABLE_ID], // Replace "density" with your property name
                ['$min', ['$get', 'sizingValues']],
                6, // When qt_mat_fund_ai is 0, radius is 6
                ['$max', ['$get', 'sizingValues']],
                20, // When qt_mat_fund_ai is 100, radius is 20
              ],
              // 'circle-radius': ['get', 'qt_mat_fund_ai'],
              'circle-color': [
                '$flat',
                [
                  ['step', ['get', VARIABLE_ID]],
                  [
                    '$naturalBreaks',
                    ['$get', 'variableValues'],
                    {
                      scalesByK: schemeRdYlGn,
                    },
                  ],
                ],
              ],
            },
          }),
        },
      },
    ],
  ]
}
