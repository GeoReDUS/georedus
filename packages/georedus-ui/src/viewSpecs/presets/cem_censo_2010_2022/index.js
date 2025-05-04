import { pick, uniqBy } from 'lodash'
import { COLOR_SCHEMES, downloadResolver, globalResources } from '../../util'

import { COLLECTION_SCHEMAS } from '../../../DevControls/importViewSpecsFromCsv'
import { resolve, resolveAsync } from '@orioro/resolve'
import { VIEW_TYPE_SURFACE_CHOROPLETH } from '../../constants'
import { fileReadAs } from '@orioro/react-ui-core'

import { buffer } from '@turf/turf'
import { GeoReDUSWorker } from '../../../GeoReDUSWorker'
import { resolveExprAsync } from '../../resolveView/resolveExpr'
import { dataJoin } from '@orioro/util'

const DEFAULT_BUFFER_SIZE = 200

const INSUFFICIENT_DATA_COLOR = 'red'

const BUILDINGS_MIN_ZOOM = 14
const BUILDINGS_3D_MIN_ZOOM = 16

//
//
//
function _applyBuffers(geometry, { bufferSize = DEFAULT_BUFFER_SIZE } = {}) {
  switch (geometry?.type) {
    case 'Point': {
      return buffer(geometry, bufferSize || DEFAULT_BUFFER_SIZE, {
        units: 'meters',
      }).geometry
    }
    case 'LineString': {
      return buffer(geometry, bufferSize || DEFAULT_BUFFER_SIZE, {
        units: 'meters',
      }).geometry
    }
    default: {
      return geometry
    }
  }
}

export function cem_censo_2010_2022(viewSpec, allViewSpecs, context) {
  const {
    collection_id,
    source_table_id,
    indicator_path,
    indicator_id,
    indicator_label,
    year = collection_id.endsWith('2010') ? '2010' : '2022',
    variable_id,
    metodology,
    keywords,
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

      // format: {
      //   number: NUMBER_FMT,
      //   below: 'Sem dados',
      // },
      // steps: ['$get', 'view.metadata.colorScaleStops'],
    },
  ]

  const _variableValueTooltipEntry = [
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
  ]

  const _customGeoJsonFeatureInfoTooltip = {
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
  }

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

  const sourceLabel = `CENSO ${year}`

  return {
    // debug: true,
    id: viewId,
    path: indicator_path,
    label: indicator_label,
    metodology,
    sourceLabel,
    viewType: VIEW_TYPE_SURFACE_CHOROPLETH,

    keywords: [
      indicator_path,
      sourceLabel,
      variant_path,
      variant_label,
      variable_id,
      keywords,
    ].filter(Boolean),

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
              'KML (.kml)',
              'GML (.gml)',
              // 'CSV (.csv)',
              'TIFF/GeoTIFF (.tif/.tiff)',
              'GeoJSON (.json/.geojson)',
              'ESRI Shapefile (armazenar arquivos .shp, .shx, .dbf, etc. em um arquivo .zip único)',
            ].join(', '),
        },
        pointsDisplayMode: {
          inactive: resolve.fn((context) => {
            const geometryTypes =
              context.value?.customSpatialAggregationUnit?.GEO_FILE_METADATA
                ?.geometryTypes

            return (
              !Array.isArray(geometryTypes) || !geometryTypes.includes('Point')
            )
          }),
          clearable: false,
          type: 'treeSelect',
          label: 'Visualizar pontos',
          options: [
            {
              path: null,
              label: 'Círculos',
              value: 'circle',
            },
            {
              path: null,
              label: 'Mapa de calor',
              value: 'heatmap',
            },
          ],
          defaultValue: 'circle',
        },
        bufferSize: {
          type: 'slider',
          label: resolve.fn((context) => {
            return `Raio de influência (${context.value?.bufferSize || DEFAULT_BUFFER_SIZE}m)`
          }),
          helperText: 'Raio de influência do ponto',
          min: 0,
          max: 2000,
          step: 50,
          defaultValue: DEFAULT_BUFFER_SIZE,
          inactive: resolve.fn((context) => {
            const geometryTypes =
              context.value?.customSpatialAggregationUnit?.GEO_FILE_METADATA
                ?.geometryTypes

            return (
              !Array.isArray(geometryTypes) ||
              (!geometryTypes.includes('Point') &&
                !geometryTypes.includes('LineString')) ||
              context.value?.pointsDisplayMode === 'heatmap'
            )
          }),
        },

        dissolveOverlappingGeometries: {
          inactive: resolve.fn((context) => {
            return (
              !Boolean(
                context.value?.customSpatialAggregationUnit?.GEO_FILE_METADATA,
              ) || context.value?.pointsDisplayMode === 'heatmap'
            )
          }),
          type: 'booleanCheckbox',
          label: 'Dissolver geometrias',
          description: 'Unir geometrias sobrepostas',
          defaultValue: false,
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
          resolveAsync.fn(async (context) => {
            const contents = await fileReadAs(
              context.view.conf.data.customSpatialAggregationUnit,
              'text',
            )

            const BASE = JSON.parse(contents)

            //
            // Generate a layer with points only
            //
            const POINTS = {
              ...BASE,
              features: BASE.features.filter(
                (feat) => feat.geometry?.type === 'Point',
              ),
            }

            const LINE_STRINGS = {
              ...BASE,
              features: BASE.features.filter(
                (feat) => feat.geometry?.type === 'LineString',
              ),
            }

            //
            // Layer with areas
            //
            const AREAS_FEATURES =
              context.view.conf.data.pointsDisplayMode === 'heatmap'
                ? //
                  // If points are set to be displayed as heatmap,
                  // remove them from area calculation
                  //
                  BASE.features.filter(
                    (feat) => feat.geometry?.type !== 'Point',
                  )
                : BASE.features

            const AREAS_BASE = {
              ...BASE,
              features: AREAS_FEATURES.map((feat) => {
                return {
                  ...feat,
                  geometry: _applyBuffers(
                    feat.geometry,
                    pick(context.view.conf.data, ['bufferSize']),
                  ),
                }
              }),
            }

            const AREAS =
              context.view.conf.data.pointsDisplayMode === 'heatmap'
                ? null
                : context.view.conf.data.dissolveOverlappingGeometries &&
                    AREAS_BASE
                  ? await GeoReDUSWorker.dissolveAreasPreservingIsolated(
                      AREAS_BASE,
                    )
                  : AREAS_BASE

            return {
              BASE,
              POINTS,
              LINE_STRINGS,
              AREAS,
            }
          }),
        ],
      },
      [
        '$let',
        {
          variableValues: [
            '$if',
            ['$empty', ['$get', 'customGeoJSON.AREAS']],
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
                    ['$get', 'customGeoJSON.AREAS'],
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
              ..._color_scheme,
              minK: 5,
            },
          ],
        },
      ],
    ],

    sources: {
      ...globalRes.sources,
      //
      // Points in custom GeoJson
      //
      customGeoJSON_Points: [
        '$if',
        [['$empty', ['$get', 'view.metadata.customGeoJSON.POINTS']]],
        null,
        resolve.fn((context) => {
          const { customGeoJSON } = context.view.metadata

          if (!customGeoJSON?.POINTS) {
            return null
          }

          return {
            type: 'geojson',
            data: customGeoJSON.POINTS,
          }
        }),
      ],

      //
      // LineStrings in custom GeoJson
      //
      customGeoJSON_LineStrings: [
        '$if',
        [['$empty', ['$get', 'view.metadata.customGeoJSON.LINE_STRINGS']]],
        null,
        resolve.fn((context) => {
          const { customGeoJSON } = context.view.metadata

          if (!customGeoJSON?.LINE_STRINGS) {
            return null
          }

          return {
            type: 'geojson',
            data: customGeoJSON.LINE_STRINGS,
          }
        }),
      ],

      //
      // The area of customGeoJson
      //
      customGeoJSON_Areas: [
        '$if',
        [['$empty', ['$get', 'view.metadata.customGeoJSON.AREAS']]],
        null,
        resolve.fn((context) => {
          // ['$get', 'view.metadata.customGeoJSON'],
          const { customGeoJSON, variableValues } = context.view.metadata

          if (!customGeoJSON?.AREAS) {
            return null
          }

          //
          // Join geometry with variableValues
          //
          const features = customGeoJSON.AREAS.features.map(
            (feat, featIndex) => {
              return {
                ...feat,
                properties: {
                  ...(feat.properties || {}),
                  //
                  // Variable values are loaded positionally
                  //
                  [context.view.conf.data.variableId]:
                    variableValues[featIndex],
                },
              }
            },
          )

          return {
            type: 'geojson',
            data: {
              ...customGeoJSON.AREAS,
              features,
            },
          }
        }),
      ],

      [VECTOR_SOURCE_ID]: {
        type: 'vector',
        attribution: sourceLabel,
        minzoom: 8,
        maxzoom: 20,
        promoteId: 'cd_setor',
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

      [`${VECTOR_SOURCE_ID}_buildings`]: {
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
                  view: 'overture_br_buildings',
                  // view: [
                  //   '$get',
                  //   [
                  //     '$template',
                  //     '${0}.collection_id',
                  //     ['$get', 'view.conf.data.variableId'],
                  //   ],
                  //   variantsByVariableId,
                  // ],
                  select: ['height', 'subtype'],
                  join_view: [
                    '$get',
                    [
                      '$template',
                      '${0}.source_table_id',
                      ['$get', 'view.conf.data.variableId'],
                    ],
                    variantsByVariableId,
                  ],
                  join_source_column: `setor_${year}_id`,
                  join_target_column: 'cd_setor',
                  join_select: [['$get', 'view.conf.data.variableId']],
                  where: {
                    municipio_id: [['$get', 'municipioId']],
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

      customGeoJSON_Areas_fill: {
        hidden: [
          '$empty',
          ['$get', 'view.conf.data.customSpatialAggregationUnit'],
        ],
        source: 'customGeoJSON_Areas',
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
          entries: [_variableValueTooltipEntry],
        },

        paint: {
          'fill-color': [
            '$if',
            ['$empty', ['$get', 'view.metadata.colorScaleStops']],
            INSUFFICIENT_DATA_COLOR,
            [
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
          ],

          // 'fill-color': [
          //   '$flat',
          //   [
          //     [
          //       'step',
          //       [
          //         'coalesce',
          //         ['get', ['$get', 'view.conf.data.variableId']],
          //         -1,
          //       ],
          //     ],
          //     ['$get', 'view.metadata.colorScaleStops'],
          //   ],
          // ],
          'fill-opacity': ['$get', 'view.conf.style.layerOpacity'],
          'fill-outline-color': 'transparent',
        },
      },

      customGeoJSON_Areas_line: {
        hidden: [
          '$empty',
          ['$get', 'view.conf.data.customSpatialAggregationUnit'],
        ],
        source: 'customGeoJSON_Areas',
        type: 'line',
        paint: {
          'line-color': _color_scheme.scalesByK[5][4],
          'line-width': 2,
        },
      },

      customGeoJSON_LineStrings_line: {
        hidden: [
          '$empty',
          ['$get', 'view.conf.data.customSpatialAggregationUnit'],
        ],
        source: 'customGeoJSON_LineStrings',
        type: 'line',
        paint: {
          'line-color': _color_scheme.scalesByK[5][4],
          'line-width': 2,
        },
        tooltip: _customGeoJsonFeatureInfoTooltip,
      },

      customGeoJSON_Points_circle: {
        hidden: [
          '$or',
          ['$empty', ['$get', 'view.conf.data.customSpatialAggregationUnit']],
          [
            '$not',
            ['$eq', ['$get', 'view.conf.data.pointsDisplayMode'], 'circle'],
          ],
        ],
        source: 'customGeoJSON_Points',
        type: 'circle',
        paint: {
          'circle-opacity': 1,
          'circle-radius': 5,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#000000',
          'circle-color': '#dddddd',
        },
        tooltip: _customGeoJsonFeatureInfoTooltip,
      },

      //
      // Polygon fill from the vector source layer
      // (setor censitario)
      //
      [`${VECTOR_SOURCE_ID}_fill`]: {
        hidden: [
          '$not',
          ['$empty', ['$get', 'view.metadata.customGeoJSON.AREAS']],
        ],
        interactive: true,
        legends: _legends,

        tooltip: {
          title: null,
          entries: [_variableValueTooltipEntry],
        },
        source: VECTOR_SOURCE_ID,
        'source-layer': 'dynamic_vector_tile',
        type: 'fill',
        // maxzoom: 14,
        paint: {
          // 'fill-color': [
          //   '$flat',
          //   [
          //     [
          //       'step',
          //       [
          //         'coalesce',
          //         ['get', ['$get', 'view.conf.data.variableId']],
          //         -1,
          //       ],
          //     ],
          //     ['$get', 'view.metadata.colorScaleStops'],
          //   ],
          // ],
          'fill-color': _vectorSourceFillColor,
          // 'fill-opacity': ['$get', 'view.conf.style.layerOpacity'],
          'fill-opacity': [
            'step',
            ['zoom'],
            ['$get', 'view.conf.style.layerOpacity'], // default: zoom < 14 → opacity = 1
            BUILDINGS_MIN_ZOOM,
            0.1, // zoom ≥ 14 → opacity = 0
          ],
          'fill-outline-color': 'transparent',
        },
      },

      //
      // Boundary lines from the vector source layer
      // (setor censitario)
      //
      [`${VECTOR_SOURCE_ID}_boundary_lines`]: {
        hidden: [
          '$not',
          ['$empty', ['$get', 'view.metadata.customGeoJSON.AREAS']],
        ],
        source: VECTOR_SOURCE_ID,
        'source-layer': 'dynamic_vector_tile',
        type: 'line',
        interactive: true,
        // minzoom: BUILDINGS_MIN_ZOOM,
        paint: {
          'line-color': _vectorSourceFillColor,
          'line-width': [
            'step',
            ['zoom'],
            // default: zoom < 14 → thin lines
            ['case', ['boolean', ['feature-state', 'hover'], false], 4, 0],
            BUILDINGS_MIN_ZOOM,
            // zoom ≥ 14 → larger lines
            ['case', ['boolean', ['feature-state', 'hover'], false], 5, 1],
          ],
          'line-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1,
            ['$get', 'view.conf.style.layerOpacity'],
          ],
          'line-dasharray': [2, 2],
        },
      },

      //
      // Buildings layer
      //
      [`${VECTOR_SOURCE_ID}_buildings`]: {
        hidden: [
          '$not',
          ['$empty', ['$get', 'view.metadata.customGeoJSON.AREAS']],
        ],
        interactive: false,
        // tooltip: {
        //   title: ['$literal', ['$get', 'feature.properties.primary_name']],
        //   entries: [],
        //   // entries: [
        //   //   _variableValueTooltipEntry,
        //   //   // ['subtype', ['$literal', ['$get', 'feature.properties.subtype']]],
        //   // ],
        // },
        source: `${VECTOR_SOURCE_ID}_buildings`,
        'source-layer': 'dynamic_vector_tile',
        type: 'fill-extrusion',
        minzoom: BUILDINGS_MIN_ZOOM,
        paint: {
          //
          // If indicator is about populacao-e-domicilios,
          // do not color paint buildings whose subtype
          // is known and is not residential.
          //
          // Otherwise, apply color to all buildings
          //
          'fill-extrusion-color': indicator_path?.startsWith(
            'População e domicílios',
          )
            ? [
                'case',
                [
                  'in',
                  ['get', 'subtype'],
                  [
                    'literal',
                    [
                      'agricultural',
                      'civic',
                      'commercial',
                      'education',
                      'entertainment',
                      'industrial',
                      'medical',
                      'military',
                      'outbuilding',
                      'religious',
                      // 'residential',
                      'service',
                      'transportation',
                    ],
                  ],
                ],
                '#EFEFEF',
                _vectorSourceFillColor,
              ]
            : _vectorSourceFillColor,
          'fill-extrusion-opacity': 0.8,
          // 'fill-extrusion-opacity': ['$get', 'view.conf.style.layerOpacity'],
          // 'fill-extrusion-outline-color': 'transparent',
          'fill-extrusion-height': [
            'step',
            ['zoom'],
            0,
            BUILDINGS_3D_MIN_ZOOM,
            ['coalesce', ['get', 'height'], 0],
          ],
          // ['get', 'height'], // Adjust as needed
        },
      },

      customGeoJSON_Points_heatmap: {
        hidden: [
          '$or',
          ['$empty', ['$get', 'view.conf.data.customSpatialAggregationUnit']],
          [
            '$not',
            ['$eq', ['$get', 'view.conf.data.pointsDisplayMode'], 'heatmap'],
          ],
        ],
        source: 'customGeoJSON_Points',
        type: 'heatmap',
      },
    },
    download: downloadResolver({
      fileNameBase: [
        '$template',
        '${0}_${1}_georedus_censo_${2}',
        [['$get', 'view.conf.data.variableId'], ['$get', 'municipioId'], year],
      ],
      mainVariableId: ['$get', 'view.conf.data.variableId'],
      availableVariableIds: [],

      // availableVariableIds: [variable_id, 'str_nome_fantasia', 'id_cnes'],
      fetchData: resolve.fn((context) => async ({ variableIds, options }) => {
        const data = await resolveExprAsync(
          [
            '$fetch',
            [
              '$template',
              `${METADATA_API_ENDPOINT}` +
                '/${source_table_id}?select=' +
                '${variableId},' +
                'cd_setor' +
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
          context,
        )

        const geometries = await resolveExprAsync(
          [
            '$fetch',
            [
              '$template',
              `${METADATA_API_ENDPOINT}` +
                '/${collection_id}?select=geom,cd_setor' +
                '&cd_mun=eq.' +
                '${municipioId}',
              {
                municipioId: ['$context', 'municipioId'],
                collection_id: [
                  '$get',
                  [
                    '$template',
                    '${0}.collection_id',
                    ['$get', 'view.conf.data.variableId'],
                  ],
                  variantsByVariableId,
                ],
              },
            ],
          ],
          context,
        )

        return dataJoin([geometries, data], {
          key: 'cd_setor',
        })
      }),
    }),
  }
}
