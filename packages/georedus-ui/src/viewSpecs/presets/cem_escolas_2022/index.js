import {
  COLOR_SCHEMES,
  downloadResolver,
  fmtMaplibreGlFilterExp,
  fmtMetadataApiFilterExp,
  influenceAreaConf,
  influenceAreaLayers,
  influenceAreaMetadata,
  influenceAreaSources,
  setupVariants,
  tableVectorSource,
  zoomSensitiveLinearSizes,
} from '../../util'

import { numerical_choropleth } from './numerical_choropleth'
import { numerical_size } from './numerical_size'
import { boolean_categorical } from './boolean_categorical'
import { categorical } from './categorical'
import { get, isPlainObject, omit, uniqBy } from 'lodash'
import { resolve } from '@orioro/resolve'
import { resolveExprAsync } from '../../resolveView/resolveExpr'
import { Z_OVERLAY_MIDDLE_2000 } from '../../zIndexes'
import { basicTooltip } from '../util'

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
    tooltip,
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

  const $sourceLabel = 'INEP'

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

  const base = {
    id: viewId,
    label: indicator_label,
    sourceLabel: $sourceLabel,
    path: indicator_path,
    metodology,

    keywords: [indicator_path, $sourceLabel, 'educação', keywords].filter(
      Boolean,
    ),

    confSchema: {
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

        showSize:
          sizing_variable_id && sizing_variable_id != variable_id
            ? {
                label: 'Matrículas',
                type: 'booleanCheckbox',
                description: 'Tamanho proporcional à quantidade de matrículas',
                defaultValue: true,
              }
            : null,

        ...influenceAreaConf({
          defaultBufferSize: 200,
        }),
      },
    },

    metadata: {
      _value: [
        '$let',
        {
          rawData: [
            '$fetch',
            {
              href: METADATA_API_ENDPOINT,
              pathname: collection_id,
              searchParams: [
                '$merge',
                {
                  select: [VARIABLE_ID, 'geom'].join(','),
                  id_municipio: _id_municipio_apiFilterExpr,
                },

                _fetchMetadataApiFilterExpResolver,
              ],
            },
          ],
        },
        {
          variableValues: [
            '$get',
            ['$template', 'rawData[].${0}', VARIABLE_ID],
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

          ...influenceAreaMetadata(),
        },
      ],
    },

    sources: {
      [VECTOR_SOURCE_ID]: tableVectorSource(context, collection_id, {
        attribution: $sourceLabel,
        promoteId: 'id_escola',
        version: 2,
        minzoom: 8,
        maxzoom: 20,
      }),

      ...influenceAreaSources({
        dataPath: 'view.metadata.influenceArea',
      }),
    },
    layers: {
      ...influenceAreaLayers({
        zIndex: Z_OVERLAY_MIDDLE_2000,
        dataPath: 'view.metadata.influenceArea',
        fillPaint: {
          'fill-color': get(COLOR_SCHEMES, 'schemeSet1.colors[1]'),
          'fill-opacity': 0.3,
        },
        boundaryPaint: {
          'line-color': get(COLOR_SCHEMES, 'schemeSet1.colors[1]'),
          'line-opacity': 0.8,
          'line-width': 2,
          'line-dasharray': [2, 2],
        },
      }),

      [`${VECTOR_SOURCE_ID}_symbol`]: {
        source: VECTOR_SOURCE_ID,
        'source-layer': VECTOR_SOURCE_ID,
        zIndex: Z_OVERLAY_MIDDLE_2000 + 2,
        filter: $layerFilter,
        type: 'symbol',
        layout: {
          'icon-image': ['literal', 'mdiSchool'],
          'icon-size': 0.6,
        },
      },
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

        zoomSensitiveLinearSizes({
          variable: ['get', sizing_variable_id],
          minValue: ['$min', ['$get', 'view.metadata.sizingValues']],
          maxValue: ['$max', ['$get', 'view.metadata.sizingValues']],
          minSize: SIZE_MIN,
          maxSize: SIZE_MAX,
        }),

        SIZE_DEFAULT,
      ]
    : SIZE_DEFAULT

  const $tooltip =
    typeof tooltip === 'object' && tooltip !== null
      ? basicTooltip({ title: 'no_escola', entries: [], ...tooltip })
      : {
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
                    [
                      '$get',
                      `feature.properties.${sizing_variable_id}::string`,
                    ],
                  ],
                ]
              : null,
            [
              'Etapas de ensino',
              [
                '$literal',
                resolve.fn((context) => {
                  const properties = context?.feature?.properties || {}

                  // Mapeamos os rótulos aos possíveis finais de string (sufixos)
                  // que essa coluna pode ter na base de 2022 ou nas bases >= 2023
                  // 'in_inf_cre' é o sufixo para a etapa "Infantil / Creche" na base de 2022, enquanto 'edu02_etp_cre_0' é o sufixo para a mesma etapa nas bases de 2023 em diante
                  // Na tabela de 2023, a coluna se chama in23_edu02_etp_cre_0, por exemplo, mas como só nos importam os sufixos finais, conseguimos usar a mesma lógica para todos os anos
                  const ETAPAS = [
                    {
                      label: 'Infantil / Creche',
                      sufixos: ['in_inf_cre', 'edu02_etp_cre_0'],
                    },
                    {
                      label: 'Infantil / Pré-escola',
                      sufixos: ['in_inf_pre', 'edu02_etp_pre_0'],
                    },
                    {
                      label: 'Fundamental I',
                      sufixos: ['in_fund_ai', 'edu02_etp_fn1_0'],
                    },
                    {
                      label: 'Fundamental II',
                      sufixos: ['in_fund_af', 'edu02_etp_fn2_0'],
                    },
                    {
                      label: 'Ensino Médio',
                      sufixos: ['in_med', 'edu02_etp_em_0'],
                    },
                  ]

                  return ETAPAS.filter(({ sufixos }) => {
                    // Percorre todas as propriedades da feature atual
                    return Object.entries(properties).some(
                      ([key, value]) =>
                        // Verifica se o nome da coluna termina com algum dos sufixos mapeados
                        // E se o valor da coluna é "truthy" (maior que 0, true, etc)
                        sufixos.some((sufixo) => key.endsWith(sufixo)) && value,
                    )
                  })
                    .map(({ label }) => label)
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
