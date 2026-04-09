import { resolve } from '@orioro/resolve'
import { get } from '@orioro/get'
import { BUILDINGS_MIN_ZOOM } from './buildings'
import { _censoColorScheme } from './metadata'
import { Z_OVERLAY_BASE_1000 } from '../../../../../zIndexes'
import { INSUFFICIENT_DATA_COLOR } from '../constants'

const SETOR_CENSITARIO_SOURCE_ID = 'ibge_malha_br_setor_censitario_2022.geom'

const NUMBER_FMT = [
  '$if',
  ['$endsWith', ['$get', 'view.conf.data.variableId'], '_pct'],
  ['pt-BR', { style: 'percent' }],
  ['pt-BR', {}],
]

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
      // TODO: review
      //
      bounds: resolve.fn(({ app }) => app.mapBounds),
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
  const { PARSED_SCHEMA } = opts

  //
  // Fill color expression for data loaded from
  // vector source
  //
  const _vectorSourceFillColor = [
    '$flat',
    [
      ['step', ['coalesce', ['get', 'value'], -1]],
      ['$get', 'view.metadata.colorScaleStops'],
    ],
  ]

  const _filter = resolve.fn(({ app }) => {
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
  })

  return {
    //
    // Polygon fill from the vector source layer
    // (setor censitario)
    //
    [`${SETOR_CENSITARIO_SOURCE_ID}_fill`]: {
      hidden: [
        '$not',
        ['$empty', ['$get', 'view.metadata.customGeoJSON.AREAS_GEOJSON']],
      ],
      interactive: true,
      source: SETOR_CENSITARIO_SOURCE_ID,
      'source-layer': SETOR_CENSITARIO_SOURCE_ID,
      type: 'fill',
      legends: setor_censitario_legends(opts),

      tooltip: {
        title: [
          '$literal',
          [
            '$template',
            'Setor censitário ${0}',
            ['$get', 'feature.properties.id'],
          ],
        ],

        entries: [
          '$literal',
          resolve.fn((context) => {
            const variableId = get(context, 'view.conf.data.variableId')
            const variableLabel = get(
              context,
              `view.metadata.labels.${variableId}`,
            )

            let mainValueDisplay

            if (variableId === 'total_pessoas_por_km2') {
              try {
                const value_src = JSON.parse(
                  context.feature.properties.value_src,
                )
                mainValueDisplay = value_src['bas.v0001']
              } catch (err) {
                console.error(err)
                mainValueDisplay = null
              }
            } else {
              const value = get(context, 'feature.properties.value')
              const isPercentage = variableId.endsWith('_pct')
              const format = isPercentage ? { style: 'percent' } : {}
              mainValueDisplay =
                typeof value === 'number'
                  ? value.toLocaleString('pt-BR', format)
                  : value
            }

            let originalVariablesUnavailableMessage
            let originalVariablesDisplay
            try {
              const value_src = JSON.parse(context.feature.properties.value_src)

              originalVariablesUnavailableMessage = ' '
              originalVariablesDisplay = Object.entries(value_src).map(
                ([key, value]) => {
                  const formattedValue =
                    typeof value === 'number'
                      ? value.toLocaleString('pt-BR')
                      : value
                  return [`- ${key}`, formattedValue]
                },
              )
            } catch (err) {
              console.err(err)
              originalVariablesUnavailableMessage = 'Dados indisponíveis'
              originalVariablesDisplay = [['Dados indisponíveis']]
            }

            return [
              [variableLabel, mainValueDisplay],
              ['Variáveis originais', originalVariablesUnavailableMessage],
              ...originalVariablesDisplay,
            ]
          }),
        ],
      },

      filter: _filter,
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

    //
    // Boundary lines from the vector source layer
    // (setor censitario)
    //
    [`${SETOR_CENSITARIO_SOURCE_ID}_bounds`]: {
      zIndex: Z_OVERLAY_BASE_1000,
      hidden: [
        '$not',
        ['$empty', ['$get', 'view.metadata.customGeoJSON.AREAS_GEOJSON']],
      ],
      interactive: true,
      type: 'line',
      source: SETOR_CENSITARIO_SOURCE_ID,
      'source-layer': SETOR_CENSITARIO_SOURCE_ID,
      filter: _filter,
      paint: {
        'line-color': resolve.fn((context) => {
          const variableId = get(context, 'view.conf.data.variableId')
          const variant = PARSED_SCHEMA.variantsByVariableId[variableId]

          return _censoColorScheme(variant.colorScheme).scalesByK[3][2]
        }),
        'line-width': [
          'step',
          ['zoom'],
          // default: zoom < 14 → thin lines
          ['case', ['boolean', ['feature-state', 'hover'], false], 2, 0],
          BUILDINGS_MIN_ZOOM,
          // zoom ≥ 14 → larger lines
          ['case', ['boolean', ['feature-state', 'hover'], false], 4, 0],
        ],
        'line-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          1,
          ['$get', 'view.conf.style.layerOpacity'],
        ],
      },
    },
  }
}
