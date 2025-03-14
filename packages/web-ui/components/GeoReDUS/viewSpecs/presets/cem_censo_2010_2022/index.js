import { uniqBy } from 'lodash'
import { COLOR_SCHEMES, globalResources } from '../../util'
import { schemeRdPu } from 'd3-scale-chromatic'

import { COLLECTION_SCHEMAS } from '../../../DevControls/importViewSpecsFromCsv'
import { resolve } from '@orioro/resolve'
import { VIEW_TYPE_SURFACE_CHOROPLETH } from '../../constants'

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

export function cem_censo_2010_2022(viewSpec, allViewSpecs, context) {
  const {
    collection_id,
    source_table_id,
    indicator_path,
    indicator_id,
    indicator_label,
    year,
    variable_id,
    metodology,
    variant_label,
    measure_unit,
    variable_id_pct,
    variant_path,
    description,
    preset,
  } = viewSpec

  const { METADATA_API_ENDPOINT, VECTOR_TILE_SERVER_ENDPOINT } = context

  const COLLECTION = COLLECTION_SCHEMAS[collection_id]

  const VECTOR_SOURCE_ID = `${collection_id}.geom`

  const globalRes = globalResources(context)

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
    variants.map((variant) => [
      variant.variable_id,
      [
        variant.variable_id === indicator_id
          ? indicator_label
          : [indicator_label, variant.variant_label].join(' | '),
        year ? `(${year})` : null,
      ]
        .filter(Boolean)
        .join(' '),
    ]),
  )
  const measureUnits = Object.fromEntries(
    variants.map((variant) => [variant.variable_id, variant.measure_unit]),
  )

  const _color_scheme = indicator_path.toLowerCase().includes('infraestrutura')
    ? COLOR_SCHEMES.schemeBlues
    : COLOR_SCHEMES.schemeOranges

  const _legends = [
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
      format: {
        number: NUMBER_FMT,
        below: 'Sem dados',
      },
      steps: ['$get', 'view.metadata.colorScaleStops'],
    },
  ]

  const sourceLabel = collection_id.endsWith('2010')
    ? 'CENSO 2010'
    : 'CENSO 2022'

  return {
    debug: true,
    id: viewId,
    path: indicator_path,
    label: indicator_label,
    metodology,
    sourceLabel,
    viewType: VIEW_TYPE_SURFACE_CHOROPLETH,
    conf: {
      data: {
        variableId: {
          label: 'Recorte:',
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
          type: 'geoFile',
          label: 'Malha territorial customizada',
          helperText:
            'Carregue um arquivo georreferenciado para visualizar os dados de acordo' +
            ' com sua própria malha territorial. Formatos de arquivo suportados: ' +
            [
              'GeoPackage (.gpkg)',
              'ESRI Shapefile (.shp)',
              'KML (.kml)',
              'GML (.gml)',
              'CSV (.csv)',
              'TIFF/GeoTIFF (.tif/.tiff)',
              'GeoJSON (.json/.geojson)',
            ].join(', '),
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
              // scalesByK: safeScheme(schemeRdPu),
              ..._color_scheme,
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
        attribution: sourceLabel,
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
      },
    },
    layers: {
      ...globalRes.layers,
      customGeoJSON_line: {
        hidden: [
          '$empty',
          ['$get', 'view.conf.data.customSpatialAggregationUnit'],
        ],
        source: 'customGeoJSON',
        type: 'line',
        paint: {
          'line-color': safeScheme(schemeRdPu)[5][4],
          'line-width': 2,
        },
      },

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
          // title: [
          //   '$literal',
          //   [
          //     '$template',
          //     'Setor ${0}',
          //     ['$get', 'feature.properties.cd_setor'],
          //   ],
          // ],
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
