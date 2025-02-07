import { METADATA_API_ENDPOINT } from '../constants'
import { globalResources, tableVectorSource } from '../util'
import { schemeRdYlBu } from 'd3-scale-chromatic'

const TABLE_ID = 'cem_censo_2010'
const VECTOR_SOURCE_ID = `${TABLE_ID}.geom`

export function cem_censo_2010({ variableId, ...override }) {
  const VARIABLE_ID = variableId
  // const label = 'Taxa de alfabetização'
  const label = variableId

  const globalRes = globalResources()

  const viewId = `${TABLE_ID}.${VARIABLE_ID}`

  const NUMBER_FMT = ['pt-BR', { style: 'percent' }]
  // const NUMBER_FMT = ['pt-BR', {}]

  return [
    viewId,
    [
      '$let',
      'variableValues',
      [
        '$get',
        `[].${VARIABLE_ID}`,
        [
          '$fetch',
          [
            '$template',
            `${METADATA_API_ENDPOINT}/${TABLE_ID}?select=${VARIABLE_ID}&cod_municipio=eq.\$\{0\}`,
            ['$context', 'municipioId'],
          ],
        ],
      ],
      {
        id: viewId,
        label,
        legends: [
          {
            type: 'SequentialColorLegend',
            title: label,
            unit: '% relativa à unidade territorial',
            format: {
              number: NUMBER_FMT,
            },
            steps: [
              '$naturalBreaks',
              ['$get', 'variableValues'],
              {
                scalesByK: schemeRdYlBu,
              },
            ],
          },
        ],
        sources: {
          ...globalRes.sources,
          [VECTOR_SOURCE_ID]: tableVectorSource(TABLE_ID, {
            minzoom: 8,
            maxzoom: 20,
          }),
        },
        layers: {
          ...globalRes.layers,
          [`${VECTOR_SOURCE_ID}_fill`]: {
            interactive: true,

            tooltip: [
              '$literal',
              {
                title: [
                  '$literal',
                  [
                    '$template',
                    'Setor ${0}',
                    ['$get', 'feature.properties.cd_geocodi'],
                  ],
                ],
                entries: [
                  [
                    label,
                    [
                      '$literal',
                      [
                        '$get',
                        `feature.properties.${VARIABLE_ID}::string({ "number": ${JSON.stringify(NUMBER_FMT)} })`,
                      ],
                    ],
                  ],
                  [
                    'Pessoas Residentes',
                    [
                      '$literal',
                      [
                        '$get',
                        `feature.properties.pop_bas_mor_tot_pes::string`,
                      ],
                    ],
                  ],
                ],
              },
            ],
            source: VECTOR_SOURCE_ID,
            'source-layer': VECTOR_SOURCE_ID,
            type: 'fill',
            filter: ['==', ['get', 'cod_municipio'], ['$get', 'municipioId']],
            paint: {
              'fill-color': [
                '$flat',
                [
                  ['step', ['get', VARIABLE_ID]],
                  [
                    '$naturalBreaks',
                    ['$get', 'variableValues'],
                    {
                      scalesByK: schemeRdYlBu,
                    },
                  ],
                ],
              ],
              'fill-opacity': 0.5,
              'fill-outline-color': 'transparent',
            },
          },
        },
      },
    ],
  ]
}
