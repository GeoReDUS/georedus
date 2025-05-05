import {
  ABOVE_BASE_MAP_LAYERS_Z_INDEX_BASE,
  COLOR_SCHEMES,
  downloadResolver,
  fmtMaplibreGlFilterExp,
  fmtMetadataApiFilterExp,
  globalResources,
  setupVariants,
  tableVectorSource,
  zoomSensitiveLinearSizes,
} from '../../util'

import { numerical_choropleth } from './numerical_choropleth'
import { numerical_size } from './numerical_size'
import { boolean_categorical } from './boolean_categorical'
import { categorical } from './categorical'
import { get, isPlainObject, omit, uniqBy } from 'lodash'
import { resolve, resolveAsync } from '@orioro/resolve'
import { resolveExprAsync } from '../../resolveView/resolveExpr'
import { GeoReDUSWorker } from '../../../GeoReDUSWorker'

const BY_TYPE = {
  numerical_choropleth,
  numerical_size,
  boolean_categorical,
  categorical,
}

const DEFAULT_BUFFER_SIZE = 200

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

        showSize: sizing_variable_id
          ? {
              label: 'Matrículas',
              type: 'booleanCheckbox',
              description: 'Tamanho proporcional à quantidade de matrículas',
              defaultValue: true,
            }
          : null,

        showInfluenceArea: {
          type: 'booleanCheckbox',
          label: 'Área de influência',
          description: 'Visualizar área de influência',
          defaultValue: true,
        },

        influenceAreaRadius: {
          type: 'slider',
          inactive: resolve.literal(
            resolve.fn((context) => !context.value?.showInfluenceArea),
          ),
          label: resolve.literal(
            resolve.fn((context) => {
              return `Raio de influência (${context.value?.influenceAreaRadius || DEFAULT_BUFFER_SIZE}m)`
            }),
          ),
          helperText: 'Raio de influência da escola',
          min: 0,
          max: 2000,
          step: 50,
          defaultValue: DEFAULT_BUFFER_SIZE,
        },
        dissolveOverlappingGeometries: {
          inactive: resolve.literal(
            resolve.fn((context) => !context.value?.showInfluenceArea),
          ),
          type: 'booleanCheckbox',
          label: 'Dissolver geometrias',
          description: 'Unir geometrias sobrepostas',
          defaultValue: false,
        },
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

          influenceArea: resolveAsync.fn(async (context) => {
            const {
              influenceAreaRadius,
              showInfluenceArea,
              dissolveOverlappingGeometries,
            } = get(context, 'view.conf.data') || {}

            if (
              showInfluenceArea &&
              typeof influenceAreaRadius === 'number' &&
              influenceAreaRadius > 0 &&
              context.rawData
            ) {
              try {
                const influenceArea = await GeoReDUSWorker.buffer(
                  {
                    type: 'FeatureCollection',
                    features: context.rawData.map((entry) => ({
                      type: 'Feature',
                      geometry: entry.geom,
                      properties: omit(entry, ['geom']),
                    })),
                  },
                  influenceAreaRadius,
                  {
                    units: 'meters',
                    dissolve: dissolveOverlappingGeometries,
                  },
                )

                return influenceArea
              } catch (err) {
                return null
              }
            }

            return null
          }),
        },
      ],
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
      influenceArea: [
        '$if',
        [['$empty', ['$get', 'view.metadata.influenceArea']]],
        null,
        resolve.fn((context) => {
          return {
            type: 'geojson',
            data: context.view.metadata.influenceArea,
          }
        }),
      ],
    },
    layers: {
      ...globalRes.layers,
      influenceArea_fill: {
        zIndex: ABOVE_BASE_MAP_LAYERS_Z_INDEX_BASE + 1,
        hidden: ['$empty', ['$get', 'view.metadata.influenceArea']],
        source: 'influenceArea',
        type: 'fill',

        paint: {
          'fill-color': get(COLOR_SCHEMES, 'schemeSet1.colors[1]'),
          'fill-opacity': 0.3,
        },
      },
      influenceArea_boundaries: {
        zIndex: ABOVE_BASE_MAP_LAYERS_Z_INDEX_BASE + 1,
        hidden: ['$empty', ['$get', 'view.metadata.influenceArea']],
        source: 'influenceArea',
        type: 'line',

        paint: {
          'line-color': get(COLOR_SCHEMES, 'schemeSet1.colors[1]'),
          'line-opacity': 0.8,
          'line-width': 2,
          'line-dasharray': [2, 2],
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
