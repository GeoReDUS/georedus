import { fileReadAs } from '@orioro/react-ui-core'
import { resolve } from '@orioro/resolve'
// import { GeoReDUSWorker } from '../../../../../../GeoReDUSWorker'
import { _censoColorScheme } from './metadata'
import { Z_OVERLAY_BASE_1000 } from '../../../../../zIndexes'
import { INSUFFICIENT_DATA_COLOR } from '../constants'

const AREA_FEATURE_TYPES = ['Polygon', 'MultiPolygon']

const NUMBER_FMT = [
  '$if',
  ['$endsWith', ['$get', 'view.conf.data.variableId'], '_pct'],
  ['pt-BR', { style: 'percent' }],
  ['pt-BR', {}],
]

export function customGeoJson_legends({ PARSED_SCHEMA }) {
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
          const value = feature.properties?.value

          return (
            typeof value === 'number' &&
            value >= stepInfo.min &&
            (value <= stepInfo.max || stepInfo.max === null)
          )
        })
      },
    },
  ]
}

export async function customGeoJSON_metadata(opts, context) {
  const { GLOBAL_CONTEXT, PARSED_SCHEMA } = opts
  try {
    //
    // Parse geo json contents
    //
    const GEO_JSON_BASE = JSON.parse(
      await fileReadAs(
        context.view.conf.data.customSpatialAggregationUnit,
        'text',
      ),
    )

    //
    // Filter out points, linestrings, keep only
    // Polygons and MultiPolygons
    //
    const AREAS_FEATURES = GEO_JSON_BASE.features.filter((feat) =>
      AREA_FEATURE_TYPES.includes(feat.geometry?.type),
    )

    //
    // Generate a GeoJson feature collection
    // with all area features
    //
    const AREAS_GEOJSON = {
      ...GEO_JSON_BASE,
      features: AREAS_FEATURES,
    }

    const variableId = context.view.conf.data.variableId
    const variant = PARSED_SCHEMA.variantsByVariableId[variableId]

    //
    // Fetch variable values using rpc aggregate_by_geojson with join
    //
    const variableValues = await fetch(
      `${GLOBAL_CONTEXT.METADATA_API_ENDPOINT}/rpc/aggregate_by_geojson`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          geometries: AREAS_FEATURES.map((feat) => feat.geometry),
          view: `${PARSED_SCHEMA.source_table_id}`, // no more need to generate a single unique table with all variables, since we are now sending the source table id in the body of the request to perform the join and aggregation in the backend
          join_table: `ibge_malha_br_setor_censitario_${PARSED_SCHEMA.year}`, // added in order to perform the join in the backend
          agg_column: variableId,
          agg_type: variableId.endsWith('_2') ? 'weighted_avg' : 'sum', // _2 is the new suffix to indicate percentage variables
        }),
      },
    ).then((res) => res.json())

    //
    // Load color scheme
    //
    const colorScheme = _censoColorScheme(variant.colorScheme)

    return {
      labels: PARSED_SCHEMA.labels,
      measureUnits: PARSED_SCHEMA.measureUnits,
      customGeoJSON: {
        AREAS_FEATURES,
        AREAS_GEOJSON,
      },
      variableValues,
      colorScaleStops: [
        '$naturalBreaks',
        variableValues,
        {
          ...colorScheme,
          minK: 5,
        },
      ],
    }
  } catch (err) {
    console.error(err)

    return {}
  }
}

export function customGeoJson_sources(opts) {
  return {
    //
    // The area of customGeoJson
    //
    customGeoJSON_Areas: [
      '$if',
      [['$empty', ['$get', 'view.metadata.customGeoJSON.AREAS_GEOJSON']]],
      null,
      resolve.fn((context) => {
        const { customGeoJSON, variableValues } = context.view.metadata

        if (!customGeoJSON?.AREAS_GEOJSON) {
          return null
        }

        //
        // Join geometry with variableValues
        //
        const featuresWithData = customGeoJSON.AREAS_GEOJSON.features.map(
          (feat, featIndex) => {
            return {
              ...feat,
              properties: {
                ...(feat.properties || {}),
                //
                // Variable values are loaded positionally
                //
                value: variableValues[featIndex],
              },
            }
          },
        )

        return {
          type: 'geojson',
          data: {
            ...customGeoJSON.AREAS_GEOJSON,
            features: featuresWithData,
          },
        }
      }),
    ],
  }
}

export function customGeoJson_layers(opts) {
  const { PARSED_SCHEMA } = opts

  return {
    customGeoJSON_Areas_fill: {
      zIndex: Z_OVERLAY_BASE_1000,
      hidden: [
        '$empty',
        ['$get', 'view.conf.data.customSpatialAggregationUnit'],
      ],
      source: 'customGeoJSON_Areas',
      type: 'fill',
      legends: customGeoJson_legends(opts),
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
                ['$get', 'feature.properties.value'],
                { number: NUMBER_FMT },
              ],
            ],
          ],
        ],
      },
      paint: {
        'fill-color': resolve.fn(({ view }) => {
          if (!view.metadata.colorScaleStops) {
            return INSUFFICIENT_DATA_COLOR
          } else {
            return [
              'step',
              ['coalesce', ['get', 'value'], -1],
              ...view.metadata.colorScaleStops,
            ]
          }
        }),
        'fill-opacity': ['$get', 'view.conf.style.layerOpacity'],
        'fill-outline-color': 'transparent',
      },
    },
    customGeoJSON_Areas_line: {
      zIndex: Z_OVERLAY_BASE_1000 + 1,
      hidden: [
        '$empty',
        ['$get', 'view.conf.data.customSpatialAggregationUnit'],
      ],
      source: 'customGeoJSON_Areas',
      type: 'line',
      paint: {
        'line-color': resolve.fn((context) => {
          const variableId = context.view.conf.data.variableId
          const variant = PARSED_SCHEMA.variantsByVariableId[variableId]

          const colorScheme = _censoColorScheme(variant.colorScheme)

          return colorScheme.scalesByK[5][4]
        }),
        'line-width': 2,
      },
    },
  }
}
