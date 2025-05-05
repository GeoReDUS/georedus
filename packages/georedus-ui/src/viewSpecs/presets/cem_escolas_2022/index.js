import {
  downloadResolver,
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
import { isPlainObject, uniqBy } from 'lodash'
import { resolve } from '@orioro/resolve'
import { resolveExprAsync } from '../../resolveView/resolveExpr'

const BY_TYPE = {
  numerical_choropleth,
  numerical_size,
  boolean_categorical,
  categorical,
}

export function cem_escolas_2022(config, allViewSpecs, context) {
  const {
    collection_id,
    variable_id,
    indicator_id,
    variant_of,
    indicator_path,
    indicator_label,
    indicator_type,
    sizing_variable_id,
    number_format = ['pt-BR', {}],
    metodology,
    keywords,
  } = config

  if (Boolean(variant_of)) {
    return null
  }

  const { variants, variantsById, loadVariant } = setupVariants(
    config,
    allViewSpecs,
  )

  const { METADATA_API_ENDPOINT } = context

  const VARIABLE_ID = variable_id
  const TABLE_ID = collection_id
  const VECTOR_SOURCE_ID = `${TABLE_ID}.geom`

  const viewId = `${collection_id}.${indicator_id}`

  const globalRes = globalResources(context)

  const sizing_variable_view = sizing_variable_id
    ? allViewSpecs.find((view) => view.variable_id === sizing_variable_id)
    : null

  const sizing_variable_label =
    sizing_variable_view?.indicator_label || sizing_variable_id

  //
  // common resolver that takes in variant filter and converts into
  // search parameters for metadata api for data fetching
  //
  const _fetchMetadataApiFilterExpResolver = resolve.fn((context) => {
    const variantId = context.view?.conf?.data?.variantId

    const variantSpec = loadVariant(variantId)

    const filter = variantId ? variantSpec.filter : null
    return filter ? fmtMetadataApiFilterExp(filter) : {}
  })
  const _id_municipio_apiFilterExpr = [
    '$template',
    'eq.${0}',
    ['$get', 'municipioId'],
  ]

  const $sourceLabel = 'INEP (Censo Escolar 2022)'

  const base = {
    id: viewId,
    label: indicator_label,
    sourceLabel: $sourceLabel,
    path: indicator_path,
    metodology,

    keywords: [indicator_path, $sourceLabel, 'educação', keywords].filter(
      Boolean,
    ),

    conf: {
      data: {
        variantId: {
          label: 'Rede de ensino:',
          type: 'treeSelect',
          options: variants.map((variant) => ({
            path: variant.variant_path,
            label: variant.variant_label || variant.indicator_id,
            value: variant.indicator_id,
          })),
          placeholder: 'Selecione uma rede',
          clearable: false,
          defaultValue: indicator_id,
        },

        showSize: sizing_variable_id
          ? {
              label: 'Matrículas',
              type: 'booleanCheckbox',
              description: 'Tamanho proporcional à quantidade de matrículas',
              defaultValue: true,
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
            searchParams: [
              '$merge',
              {
                select: VARIABLE_ID,
                id_municipio: _id_municipio_apiFilterExpr,
              },

              _fetchMetadataApiFilterExpResolver,
            ],
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

                    searchParams: [
                      '$merge',
                      {
                        select: sizing_variable_id,
                        id_municipio: _id_municipio_apiFilterExpr,
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
            ],
            null,
          ]
        : null,
    },

    sources: {
      ...globalRes.sources,
      [VECTOR_SOURCE_ID]: tableVectorSource(context, collection_id, {
        attribution: $sourceLabel,
        promoteId: 'id_escola',
        version: 2,
        minzoom: 8,
        maxzoom: 20,
      }),
    },
    layers: {
      ...globalRes.layers,
    },

    download: downloadResolver({
      fileNameBase: [
        '$template',
        '${0}_${1}_georedus_edu',
        [VARIABLE_ID, ['$get', 'municipioId']],
      ],
      mainVariableId: VARIABLE_ID,
      availableVariableIds: uniqBy(
        allViewSpecs
          .filter((spec) => Boolean(spec.variable_id))
          .map((spec) => ({
            label: [spec.indicator_label, spec.variant_label]
              .filter(Boolean)
              .join(' | '),
            value: spec.variable_id,
          })),
        (opt) => opt.value,
      ),

      fetchData: resolve.fn((context) => async ({ variableIds, options }) => {
        return await resolveExprAsync(
          [
            '$fetch',
            {
              href: METADATA_API_ENDPOINT,
              pathname: collection_id,

              searchParams: [
                '$merge',
                {
                  select: [
                    'geom',
                    'no_escola',
                    'id_escola',
                    ...variableIds,
                  ].join(','),
                  id_municipio: _id_municipio_apiFilterExpr,
                },
                _fetchMetadataApiFilterExpResolver,
              ],
            },
          ],
          context,
        )
      }),
    }),
  }

  const SIZE_DEFAULT = 10
  const SIZE_MAX = 25
  const SIZE_MIN = 6

  //
  // Specify some utilities connected to the base setup
  // but that will need specific placement at the indicator_type
  // preset
  //
  const $layerFilter = resolve.fn((context) => {
    const variantId = context.view?.conf?.data?.variantId
    const variantSpec = loadVariant(variantId)
    const filter = variantId ? variantSpec.filter : null
    return [
      'all',
      ['==', ['get', 'id_municipio'], ['$get', 'municipioId']],
      ...(isPlainObject(filter) ? fmtMaplibreGlFilterExp(filter) : []),
    ]
  })

  const $circleRadius = sizing_variable_id
    ? [
        '$if',
        [
          '$and',
          ['$get', 'view.conf.data.showSize'],
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
    title: ['$literal', ['$get', 'feature.properties.no_escola']],
    entries: [
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
      ],
      sizing_variable_id
        ? [
            sizing_variable_label,
            [
              '$literal',
              ['$get', `feature.properties.${sizing_variable_id}::string`],
            ],
          ]
        : null,
      [
        'Etapas de ensino',
        [
          '$literal',
          resolve.fn((context) => {
            const ETAPAS = {
              in_inf_cre: 'Infantil / Creche',
              in_inf_pre: 'Infantil / Pré-escola',
              in_fund_ai: 'Fundamental I',
              in_fund_af: 'Fundamental II',
              in_med: 'Ensino Médio',
            }

            return Object.entries(ETAPAS)
              .filter(
                ([key, label]) =>
                  context?.feature?.properties &&
                  context?.feature?.properties[key],
              )
              .map(([key, label]) => label)
              .join(', ')
          }),
        ],
      ],
      [
        'Rede de ensino',
        ['$literal', ['$get', 'feature.properties.tp_dependencia']],
      ],
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
            title: sizing_variable_label,
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

  return typeParser(base, {
    ...config,

    $circleRadius,
    $tooltip,
    $legends,
    $layerFilter,
  })
}
