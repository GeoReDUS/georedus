import { uniqBy } from 'lodash'
import {
  METADATA_API_ENDPOINT,
  VECTOR_TILE_SERVER_ENDPOINT,
} from '../../constants'
import { globalResources, tableVectorSource } from '../../util'
import { schemeRdPu } from 'd3-scale-chromatic'

import { COLLECTION_SCHEMAS } from '../../../DevControls/importViewSpecsFromCsv'
import { resolve } from '@orioro/resolve'
import { get } from '@orioro/get'
import { fileReadAs } from '@orioro/react-ui-core'

function safeScheme(scheme) {
  //
  // d3 schemes use sparse arrays (new Array(3)) to
  // keep initial schemes empty:
  //
  // https://github.com/d3/d3-scale-chromatic/blob/main/src/diverging/RdYlBu.js
  //
  // This causes some issues for us, thus we convert
  // those sparse arrays into same structure but filled ones
  //
  return Array.from(scheme, (d) => d || null)
}

export function cem_censo_2010_2022(viewSpec, allViewSpecs) {
  const {
    collection_id,
    source_table_id,
    indicator_path,
    indicator_id,
    indicator_label,
    variable_id,
    variant_label,
    measure_unit,
    variable_id_pct,
    variant_path,
    description,
    preset,
  } = viewSpec

  const COLLECTION = COLLECTION_SCHEMAS[collection_id]

  const VECTOR_SOURCE_ID = `${collection_id}.geom`

  const globalRes = globalResources()

  const viewId = `${collection_id}.${variable_id}`

  // const isPercentage = variable_id.endsWith('_pct')

  // const number_format =
  //   viewSpec.number_format || isPercentage ? 'percent' : ['pt-BR']

  const NUMBER_FMT = [
    '$if',
    ['$endsWith', ['$get', 'view.conf.data.variableId'], '_pct'],
    ['pt-BR', { style: 'percent' }],
    ['pt-BR', {}],
  ]

  // const NUMBER_FMT = ['pt-BR', {}]
  // typeof number_format === 'string'
  //   ? ['pt-BR', { style: number_format }]
  //   : number_format

  if (variable_id !== indicator_id) {
    return null
  }

  if (!COLLECTION || !COLLECTION.variable_ids.includes(variable_id)) {
    console.warn(`found invalid variable ${variable_id}, will ignore`)

    return null
  }

  if (!source_table_id) {
    console.warn(
      `found variable without source source_table_id, will ignore ${variable_id}`,
    )
    return null
  }

  const variants = uniqBy(
    allViewSpecs.filter(
      (otherViewSpec) => otherViewSpec.indicator_id === indicator_id,
    ),
    (viewSpec) => viewSpec.variable_id,
  )

  const variantsByVariableId = Object.fromEntries(
    variants.map((variant) => [variant.variable_id, variant]),
  )

  const labels = Object.fromEntries(
    variants.map((variant) => [variant.variable_id, variant.variant_label]),
  )
  const measureUnits = Object.fromEntries(
    variants.map((variant) => [variant.variable_id, variant.measure_unit]),
  )

  const _legends = [
    {
      type: 'SequentialColorLegend',
      title: [
        '$join',
        [
          indicator_label,
          [
            '$get',
            ['$get', 'view.conf.data.variableId'],
            ['$get', 'view.metadata.labels'],
          ],
        ],
        ' | ',
      ],
      unit: measure_unit,
      format: {
        number: NUMBER_FMT,
        below: 'Sem dados',
      },
      steps: ['$get', 'view.metadata.colorScaleStops'],
    },
  ]

  return {
    debug: true,
    id: viewId,
    path: indicator_path,
    label: indicator_label,
    sourceLabel: collection_id.endsWith('2010') ? 'CENSO 2010' : 'CENSO 2022',
    conf: {
      data: {
        variableId: {
          type: 'treeSelect',
          options: variants.map((variant) => ({
            path: variant.variant_path,
            label: variant.variant_label || variant.variable_id,
            value: variant.variable_id,
          })),
          placeholder: 'Selecione uma variante',
          clearable: false,
          defaultValue: variable_id,
        },
        customSpatialAggregationUnit: {
          type: 'file',
          label: 'Malha territorial customizada',
        },
      },
      style: {
        layerOpacity: {
          type: 'slider',
          label: 'Opacidade da camada',
          size: '1',
          min: 0,
          max: 1,
          step: 0.01,
          defaultValue: 0.6,
        },
      },
    },

    metadata: [
      '$let',
      {
        customGeoJSON: [
          '$if',
          ['$empty', ['$get', 'view.conf.data.customSpatialAggregationUnit']],
          null,
          [
            '$fileReadAs',
            ['$get', 'view.conf.data.customSpatialAggregationUnit'],
            'geojson',
          ],
        ],
      },
      [
        '$let',
        {
          variableValues: [
            '$if',
            ['$empty', ['$get', 'view.conf.data.customSpatialAggregationUnit']],
            [
              '$get',
              ['$template', '[].${0}', ['$get', 'view.conf.data.variableId']],
              [
                '$fetch',
                [
                  '$template',
                  `${METADATA_API_ENDPOINT}` +
                    '/${source_table_id}?select=' +
                    '${variableId}' +
                    '&cd_mun=eq.' +
                    '${municipioId}',
                  {
                    variableId: ['$get', 'view.conf.data.variableId'],
                    municipioId: ['$context', 'municipioId'],
                    source_table_id: [
                      '$get',
                      [
                        '$template',
                        '${0}.source_table_id',
                        ['$get', 'view.conf.data.variableId'],
                      ],
                      variantsByVariableId,
                    ],
                  },
                ],
              ],
            ],
            [
              '$fetch',
              {
                href: METADATA_API_ENDPOINT,
                pathname: 'rpc/aggregate_by_geojson',
              },
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: {
                  geometries: [
                    '$get',
                    'features[].geometry',
                    ['$get', 'customGeoJSON'],
                  ],
                  view: 'ibge_malha_br_setor_censitario_2010_spatial_agg',
                  agg_column: ['$get', 'view.conf.data.variableId'],
                  agg_type: [
                    '$if',
                    [
                      '$endsWith',
                      ['$get', 'view.conf.data.variableId'],
                      '_pct',
                    ],
                    'weighted_avg',
                    'sum',
                  ],
                },
              },
            ],
            // [
            //   100, 400, 339, 66, 838, 661, 883, 33, 100, 400, 339, 66, 838, 661,
            //   883, 33, 100, 400, 339, 66, 838, 661, 883, 33, 100, 400, 339, 66,
            //   838, 661, 883, 33,
            // ],
          ],
        },
        {
          labels,
          measureUnits,
          variableValues: ['$get', 'variableValues'],
          customGeoJSON: ['$get', 'customGeoJSON'],
          colorScaleStops: [
            '$naturalBreaks',
            ['$get', 'variableValues'],
            {
              scalesByK: safeScheme(schemeRdPu),
              minK: 5,
            },
          ],
        },
      ],
    ],

    sources: {
      ...globalRes.sources,

      customGeoJSON: [
        '$if',
        [['$empty', ['$get', 'view.metadata.customGeoJSON']]],
        null,
        resolve.fn((context) => {
          // ['$get', 'view.metadata.customGeoJSON'],
          const { customGeoJSON, variableValues } = context.view.metadata

          if (!customGeoJSON) {
            return null
          }

          return {
            type: 'geojson',
            data: {
              ...customGeoJSON,
              features: customGeoJSON.features.map((feature, index) => ({
                ...feature,
                properties: {
                  ...(feature.properties || {}),
                  [context.view.conf.data.variableId]: variableValues[index],
                },
              })),
            },
          }
        }),
      ],

      [VECTOR_SOURCE_ID]: {
        type: 'vector',
        minzoom: 6,
        maxzoom: 20,
        tiles: [
          [
            '$join',
            [
              `${VECTOR_TILE_SERVER_ENDPOINT}/dynamic_vector_tiles/{z}/{x}/{y}?`,
              [
                '$urlSearch',
                {
                  view: [
                    '$get',
                    [
                      '$template',
                      '${0}.collection_id',
                      ['$get', 'view.conf.data.variableId'],
                    ],
                    variantsByVariableId,
                  ],
                  select: ['cd_setor'],
                  join_view: [
                    '$get',
                    [
                      '$template',
                      '${0}.source_table_id',
                      ['$get', 'view.conf.data.variableId'],
                    ],
                    variantsByVariableId,
                  ],
                  join_source_column: 'cd_setor',
                  join_target_column: 'cd_setor',
                  join_select: [['$get', 'view.conf.data.variableId']],
                  where: {
                    cd_mun: [['$get', 'municipioId']],
                  },
                },
              ],
            ],
          ],
        ],

        // tiles: [
        //   `http://localhost:6002/dynamic_vector_tile/{z}/{x}/{y}?view=ibge_malha_br_setor_censitario_2010_2&select=%5B%22tipo%22%5D&join_view=cem_censo_2010_rel&join_source_column=cd_setor&join_target_column=cd_setor&join_select=%5B%22${variable_id}%22%5D`,
        //   // `http://localhost:6002/dynamic_vector_tile/{z}/{x}/{y}?view=ibge_malha_br_setor_censitario_2010_2&select=%5B%22tipo%22%5D&join.view=cem_censo_2010_rel&join.source_key=cd_setor&join.target_key=cd_setor&join.select=%5B%22${variable_id}%22%5D`
        //   // `http://localhost:6002/dynamic_vector_tile/{z}/{x}/{y}?main_view_name=ibge_malha_br_setor_censitario_2010_2&main_view_join_key=cd_setor&join_view_name=cem_censo_2010_rel&join_view_join_key=cd_setor&main_view_select=%5B%22tipo%22%5D&join_view_select=%5B%22${variable_id}%22%5D`,
        // ],
      },
      // [VECTOR_SOURCE_ID]: tableVectorSource(collection_id, {
      //   minzoom: 8,
      //   maxzoom: 20,
      // }),
    },
    layers: {
      ...globalRes.layers,

      customGeoJSON_fill: {
        hidden: [
          '$empty',
          ['$get', 'view.conf.data.customSpatialAggregationUnit'],
        ],
        source: 'customGeoJSON',
        type: 'fill',
        legends: _legends,
        tooltip: {
          title: [
            '$literal',
            [
              '$coalesce',
              ['$get', 'feature.properties.name'],
              ['$get', 'feature.properties.nome'],
              ['$get', 'feature.properties.label'],
              ['$get', 'feature.properties.title'],
              ['$get', 'feature.properties.id'],
              [
                '$get',
                ['$get', '0', ['$keys', ['$get', 'feature.properties']]],
                ['$get', 'feature.properties'],
              ],
            ],
          ],
          entries: ['$literal', ['$entries', ['$get', 'feature.properties']]],
        },
        paint: {
          'fill-color': [
            '$flat',
            [
              [
                'step',
                [
                  'coalesce',
                  ['get', ['$get', 'view.conf.data.variableId']],
                  -1,
                ],
              ],
              ['$get', 'view.metadata.colorScaleStops'],
            ],
          ],
          'fill-opacity': ['$get', 'view.conf.style.layerOpacity'],
          'fill-outline-color': 'transparent',
        },

        // type: 'geojson',
        // data: [
        //   '$fileReadAs',
        //   ['$get', 'view.conf.data.customSpatialAggregationUnit'],
        //   'geojson',
        // ],
      },

      [`${VECTOR_SOURCE_ID}_fill`]: {
        hidden: [
          '$not',
          ['$empty', ['$get', 'view.conf.data.customSpatialAggregationUnit']],
        ],
        // interactive: [
        //   '$empty',
        //   ['$get', 'view.conf.data.customSpatialAggregationUnit'],
        // ],
        legends: _legends,

        tooltip: {
          title: [
            '$literal',
            [
              '$template',
              'Setor ${0}',
              ['$get', 'feature.properties.cd_setor'],
            ],
          ],
          entries: [
            [
              ['$get', 'view.conf.data.variableId'],
              [
                '$literal',
                [
                  '$fmt',
                  [
                    '$get',
                    [
                      '$template',
                      'feature.properties.${0}',
                      // `::string({ "number": ${JSON.stringify(NUMBER_FMT)} })`,
                      ['$get', 'view.conf.data.variableId'],
                    ],
                  ],
                  { number: NUMBER_FMT },
                ],
              ],
            ],
          ],
        },
        source: VECTOR_SOURCE_ID,
        'source-layer': 'dynamic_vector_tile',
        type: 'fill',
        // filter: ['==', ['get', 'cd_mun'], ['$get', 'municipioId']],
        paint: {
          'fill-color': [
            '$flat',
            [
              [
                'step',
                [
                  'coalesce',
                  ['get', ['$get', 'view.conf.data.variableId']],
                  -1,
                ],
              ],
              ['$get', 'view.metadata.colorScaleStops'],
            ],
          ],
          'fill-opacity': ['$get', 'view.conf.style.layerOpacity'],
          'fill-outline-color': 'transparent',
        },
      },
    },
  }
}
