import {
  fmtMaplibreGlFilterExp,
  fmtMetadataApiFilterExp,
  globalResources,
  setupVariants,
  tableVectorSource,
} from '../../util'

import { numerical_choropleth } from './numerical_choropleth'
import { numerical_size } from './numerical_size'
import { boolean_categorical } from './boolean_categorical'
import { categorical } from './categorical'
import { resolve } from '@orioro/resolve'
import { isPlainObject } from 'lodash'

const BY_TYPE = {
  numerical_choropleth,
  numerical_size,
  boolean_categorical,
  categorical,
}

export function cem_saude_2024(viewSpec, allViewSpecs, context) {
  const {
    collection_id,
    metodology,
    indicator_id,
    variable_id,
    indicator_path,
    indicator_label,
    indicator_type,
    sizing_variable_id,
    number_format = ['pt-BR', {}],
  } = viewSpec

  const { METADATA_API_ENDPOINT } = context

  const VARIABLE_ID = variable_id
  const TABLE_ID = collection_id
  const VECTOR_SOURCE_ID = `${TABLE_ID}.geom`

  const viewId = `${collection_id}.${indicator_id}`

  const globalRes = globalResources(context)

  const { variants, loadVariant } = setupVariants(viewSpec, allViewSpecs)

  //
  // common resolver that takes in variant filter and converts into
  // search parameters for metadata api for data fetching
  //
  const _fetchMetadataApiFilterExpResolver = resolve.fn((context) => {
    const variantId = context.view?.conf?.data?.variantId || indicator_id

    const variantSpec = loadVariant(variantId)

    const filter = variantId ? variantSpec.filter : null
    return filter ? fmtMetadataApiFilterExp(filter) : {}
  })

  const $layerFilter = resolve.fn((context) => {
    const variantId = context.view?.conf?.data?.variantId || indicator_id
    const variantSpec = loadVariant(variantId)
    const filter = variantId ? variantSpec.filter : null
    return [
      'all',
      [
        '==',
        ['get', 'id_municipio_gestor'],
        ['$substr', ['$get', 'municipioId'], 0, 6],
      ],
      ...(isPlainObject(filter) ? fmtMaplibreGlFilterExp(filter) : []),
    ]
  })

  const $sourceLabel = 'CNES'

  const base = {
    id: viewId,
    label: indicator_label,
    path: indicator_path,
    sourceLabel: $sourceLabel,
    metodology,

    conf: {
      data: {
        // variantId: {
        //   label: 'Rede de ensino:',
        //   type: 'treeSelect',
        //   options: variants.map((variant) => ({
        //     path: variant.variant_path,
        //     label: variant.variant_label || variant.indicator_id,
        //     value: variant.indicator_id,
        //   })),
        //   placeholder: 'Selecione uma rede',
        //   clearable: false,
        //   defaultValue: indicator_id,
        // },
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

            searchParams: [
              '$merge',
              {
                select: VARIABLE_ID,
                id_municipio_gestor: [
                  '$template',
                  'eq.${0}',
                  ['$substr', ['$get', 'municipioId'], 0, 6],
                ],
              },
              _fetchMetadataApiFilterExpResolver,
            ],

            // searchParams: {
            //   select: VARIABLE_ID,
            //   id_municipio_gestor: [
            //     '$template',
            //     'eq.${0}',
            //     ['$substr', ['$get', 'municipioId'], 0, 6],
            //   ],
            // },
          },
        ],
      ],

      sizingValues: sizing_variable_id
        ? [
            '$filter',
            [
              '$get',
              [
                '$template',
                '[].${0}',
                sizing_variable_id,
                // ['$get', 'view.conf.data.sizingVariable'],
              ],
              [
                '$fetch',
                {
                  href: METADATA_API_ENDPOINT,
                  pathname: collection_id,

                  searchParams: [
                    '$merge',
                    {
                      select: sizing_variable_id,
                      // select: ['$get', 'view.conf.data.sizingVariable'],
                      id_municipio_gestor: [
                        '$template',
                        'eq.${0}',
                        ['$substr', ['$get', 'municipioId'], 0, 6],
                      ],
                    },
                    _fetchMetadataApiFilterExpResolver,
                  ],
                },
              ],
            ],
            [
              '$and',
              ['$not', ['$empty', ['$iterator', 'item']]],
              ['$gt', ['$iterator', 'item'], 0],
            ],
          ]
        : null,
    },

    sources: {
      ...globalRes.sources,
      [VECTOR_SOURCE_ID]: tableVectorSource(context, collection_id, {
        attribution: $sourceLabel,
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
  // const $circleRadius = dynamic_sizing
  //   ? [
  //       'interpolate',
  //       ['linear'],
  //       ['get', ['$get', 'view.conf.data.sizingVariable']], // Replace "density" with your property name
  //       ['$min', ['$get', 'view.metadata.sizingValues']],
  //       SIZE_MIN, // When qt_mat_fund_ai is 0, radius is 6
  //       ['$max', ['$get', 'view.metadata.sizingValues']],
  //       SIZE_MAX, // When qt_mat_fund_ai is 100, radius is 20
  //     ]
  //   : SIZE_DEFAULT

  const $circleRadius = sizing_variable_id
    ? [
        '$if',
        [
          '$and',
          // ['$get', 'view.conf.data.showSize'],
          [
            '$gt',
            ['$get', 'length', ['$get', 'view.metadata.sizingValues']],
            1,
          ],
        ],
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
    title: ['$literal', ['$get', 'feature.properties.str_nome_fantasia']],
    entries: [
      ['ID CNES', ['$literal', ['$get', 'feature.properties.id_cnes']]],
      [
        indicator_label,
        [
          '$literal',
          [
            '$coalesce',
            [
              '$get',
              `feature.properties.${VARIABLE_ID}::string({
                number: ${JSON.stringify(number_format)},
                boolean: {
                  true: 'Sim',
                  false: 'Não'
                }
              })`,
            ],
            'Sem dados',
          ],
        ],
        // ['$literal', ['$get', `feature.properties.${VARIABLE_ID}::string`]],
      ],

      sizing_variable_id
        ? [
            indicator_label,
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
        {
          type: 'ProportionalSymbolLegend',
          // unit: 'Matrículas',
          title: indicator_label,
          min: ['$min', ['$get', 'view.metadata.sizingValues']],
          max: ['$max', ['$get', 'view.metadata.sizingValues']],
          sizeMin: SIZE_MIN * 2,
          sizeMax: SIZE_MAX * 2,
          numberFormat: ['pt-BR', { maximumFractionDigits: 0 }],
        },
      ]
    : []
  const typeParser = BY_TYPE[indicator_type]

  if (!typeParser) {
    console.warn(`Ignoring unknown indicator_type ${indicator_type}`)
    return null
  }

  return typeParser(base, {
    ...viewSpec,
    $circleRadius,
    $tooltip,
    $legends,
    $layerFilter,
  })
}
