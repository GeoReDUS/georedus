import { METADATA_API_ENDPOINT } from '../../constants'
import { globalResources, tableVectorSource } from '../../util'

import { numerical_choropleth } from './numerical_choropleth'
import { numerical_size } from './numerical_size'
import { boolean_categorical } from './boolean_categorical'
import { categorical } from './categorical'

const BY_TYPE = {
  numerical_choropleth,
  numerical_size,
  boolean_categorical,
  categorical,
}

export function cem_escolas_2022(config) {
  const {
    collection_id,
    indicator_id,
    indicator_path,
    indicator_label,
    indicator_type,
    sizing_variable_id,
  } = config

  const VARIABLE_ID = indicator_id
  const TABLE_ID = collection_id
  const VECTOR_SOURCE_ID = `${TABLE_ID}.geom`

  const viewId = `${collection_id}.${VARIABLE_ID}`

  const globalRes = globalResources()

  const base = {
    id: viewId,
    label: indicator_label,
    path: indicator_path,

    conf: {
      data: {
        showSize: sizing_variable_id
          ? {
              label: 'Matrículas',
              type: 'booleanCheckbox',
              description: 'Tamanho proporcional à quantidade de matrículas',
              defaultValue: false,
            }
          : null,
      },
    },

    metadata: {
      variableValues: [
        '$get',
        ['$template', '[].${0}', VARIABLE_ID],
        [
          '$fetch',
          {
            href: METADATA_API_ENDPOINT,
            pathname: collection_id,
            searchParams: {
              select: VARIABLE_ID,
              co_municipio: ['$template', 'eq.${0}', ['$get', 'municipioId']],
            },
          },
        ],
      ],
      sizingValues: sizing_variable_id
        ? [
            '$if',
            ['$get', 'view.conf.data.showSize'],
            [
              '$filter',
              [
                '$get',
                ['$template', '[].${0}', sizing_variable_id],
                [
                  '$fetch',
                  {
                    href: METADATA_API_ENDPOINT,
                    pathname: collection_id,
                    searchParams: {
                      select: sizing_variable_id,
                      co_municipio: [
                        '$template',
                        'eq.${0}',
                        ['$get', 'municipioId'],
                      ],
                    },
                  },
                ],
              ],
              [
                '$and',
                ['$not', ['$empty', ['$iterator', 'item']]],
                ['$gt', ['$iterator', 'item'], 0],
              ],
            ],
            null,
          ]
        : null,
    },

    sources: {
      ...globalRes.sources,
      [VECTOR_SOURCE_ID]: tableVectorSource(collection_id, {
        minzoom: 8,
        maxzoom: 20,
      }),
    },
    layers: {
      ...globalRes.layers,
    },
  }

  const SIZE_DEFAULT = 10
  const SIZE_MAX = 25
  const SIZE_MIN = 6

  //
  // Specify some utilities connected to the base setup
  // but that will need specific placement at the indicator_type
  // preset
  //
  const $circleRadius = sizing_variable_id
    ? [
        '$if',
        ['$get', 'view.conf.data.showSize'],
        [
          'interpolate',
          ['linear'],
          ['get', sizing_variable_id], // Replace "density" with your property name
          ['$min', ['$get', 'view.metadata.sizingValues']],
          SIZE_MIN, // When qt_mat_fund_ai is 0, radius is 6
          ['$max', ['$get', 'view.metadata.sizingValues']],
          SIZE_MAX, // When qt_mat_fund_ai is 100, radius is 20
        ],
        SIZE_DEFAULT,
      ]
    : SIZE_DEFAULT

  const $tooltip = {
    title: ['$literal', ['$get', 'feature.properties.no_entidade']],
    entries: [
      [
        indicator_label,
        ['$literal', ['$get', `feature.properties.${VARIABLE_ID}::string`]],
      ],
      sizing_variable_id
        ? [
            sizing_variable_id,
            [
              '$literal',
              ['$get', `feature.properties.${sizing_variable_id}::string`],
            ],
          ]
        : null,
    ].filter(Boolean),
  }

  const $legends = sizing_variable_id
    ? [
        [
          '$if',
          ['$get', 'view.conf.data.showSize'],
          {
            type: 'ProportionalSymbolLegend',
            unit: 'Matrículas',
            title: sizing_variable_id,
            min: ['$min', ['$get', 'view.metadata.sizingValues']],
            max: ['$max', ['$get', 'view.metadata.sizingValues']],
            sizeMin: SIZE_MIN * 2,
            sizeMax: SIZE_MAX * 2,
            numberFormat: ['pt-BR', { maximumFractionDigits: 0 }],
          },
          null,
        ],
      ]
    : []

  const typeParser = BY_TYPE[indicator_type]

  if (!typeParser) {
    console.warn(`Ignoring unknown indicator_type ${indicator_type}`)
    return null
  }

  return typeParser(base, { ...config, $circleRadius, $tooltip, $legends })
}
