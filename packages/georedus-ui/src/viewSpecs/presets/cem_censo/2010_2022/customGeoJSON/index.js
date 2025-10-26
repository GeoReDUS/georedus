import { resolve } from '@orioro/resolve'

import { INSUFFICIENT_DATA_COLOR } from '../chartUtil'

export function customGeoJSON(viewSpec, allViewSpecs, context, { CHART_UTIL }) {
  const sources = {
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
        const { customGeoJSON, variableValues } = context.view.metadata

        if (!customGeoJSON?.AREAS) {
          return null
        }

        //
        // Join geometry with variableValues
        //
        const features = customGeoJSON.AREAS.features.map((feat, featIndex) => {
          return {
            ...feat,
            properties: {
              ...(feat.properties || {}),
              //
              // Variable values are loaded positionally
              //
              [context.view.conf.data.variableId]: variableValues[featIndex],
            },
          }
        })

        return {
          type: 'geojson',
          data: {
            ...customGeoJSON.AREAS,
            features,
          },
        }
      }),
    ],
  }

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

  const layers = {
    customGeoJSON_Areas_fill: {
      hidden: [
        '$empty',
        ['$get', 'view.conf.data.customSpatialAggregationUnit'],
      ],
      source: 'customGeoJSON_Areas',
      type: 'fill',
      legends: CHART_UTIL._legends,
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
        entries: [CHART_UTIL._variableValueTooltipEntry],
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
        'line-color': CHART_UTIL._color_scheme.scalesByK[5][4],
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
        'line-color': CHART_UTIL._color_scheme.scalesByK[5][4],
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
  }

  return {
    sources,
    layers,
  }
}
