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

export function cem_saude_2024(config, otherViewSpecs, context) {
  const {
    collection_id,
    metodology,
    indicator_id,
    variable_id,
    indicator_path,
    indicator_label,
    indicator_type,
    dynamic_sizing,
    tipo_equipamento_in,
  } = config

  const { METADATA_API_ENDPOINT } = context

  const VARIABLE_ID = variable_id
  const TABLE_ID = collection_id
  const VECTOR_SOURCE_ID = `${TABLE_ID}.geom`

  const viewId = `${collection_id}.${indicator_id}`

  const globalRes = globalResources(context)

  const base = {
    id: viewId,
    label: indicator_label,
    path: indicator_path,
    metodology,

    conf: {
      data: {
        sizingVariable: dynamic_sizing
          ? {
              type: 'select',
              label: 'Tamano proporcional à',
              options: [
                {
                  value: 'leitos_q',
                  label:
                    'Quantidade de leitos hospitalares (Leitos Cirúrgicos + Clínicos + Complementares)',
                },
                {
                  value: 'qtinstue',
                  label:
                    'Quantidade de instalações físicas de Urgência/Emergência',
                },
                {
                  value: 'qtinstaa',
                  label:
                    'Quantidade de instalações de Atendimento Ambulatorial',
                },
                {
                  value: 'qtinstcc',
                  label:
                    'Quantidade de instalações de Atendimento Hospitalar do tipo Centro Cirúrgico',
                },
                {
                  value: 'qtinstco',
                  label:
                    'Quantidade de instalações de Atendimento Hospitalar do tipo Centro Obstétrico',
                },
                {
                  value: 'qtinstun',
                  label:
                    'Quantidade de instalações de Atendimento Hospitalar do tipo Unidade Neonatal',
                },
                {
                  value: 'profs',
                  label: 'Quantidade de Profissionais no Estabelecimento',
                },
                {
                  value: 'esp',
                  label: 'Quantidade de Especializações Diferentes',
                },
                { value: 'qt_medico', label: 'Quantidade de Médicos' },
                {
                  value: 'equipes_dif',
                  label: 'Quantidade de Equipes Diferentes',
                },
                { value: 'equipes', label: 'Quantidade de Equipes' },
                { value: 'leitos_sus', label: 'Quantidade de Letios SUS' },
                {
                  value: 'leitos_dif',
                  label: 'Quantidade de Letios diferentes',
                },
                { value: 'equipamentos', label: 'Quantidade de Equipamentos' },
                {
                  value: 'equipamentos_dif',
                  label: 'Quantidade de Equipamentos Diferentes',
                },
              ],
              defaultValue: 'leitos_q',
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
              co_municipio_gestor: [
                '$template',
                'eq.${0}',
                ['$substr', ['$get', 'municipioId'], 0, 6],
              ],
            },
          },
        ],
      ],
      sizingValues: dynamic_sizing
        ? [
            '$filter',
            [
              '$get',
              [
                '$template',
                '[].${0}',
                ['$get', 'view.conf.data.sizingVariable'],
              ],
              [
                '$fetch',
                {
                  href: METADATA_API_ENDPOINT,
                  pathname: collection_id,
                  searchParams: {
                    select: ['$get', 'view.conf.data.sizingVariable'],
                    co_municipio_gestor: [
                      '$template',
                      'eq.${0}',
                      ['$substr', ['$get', 'municipioId'], 0, 6],
                    ],
                    ds_tipo_estabelecimento: [
                      '$template',
                      'in.(${0})',
                      ['$join', tipo_equipamento_in, ','],
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
          ]
        : null,
    },

    sources: {
      ...globalRes.sources,
      [VECTOR_SOURCE_ID]: tableVectorSource(context, collection_id, {
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
  const $circleRadius = dynamic_sizing
    ? [
        'interpolate',
        ['linear'],
        ['get', ['$get', 'view.conf.data.sizingVariable']], // Replace "density" with your property name
        ['$min', ['$get', 'view.metadata.sizingValues']],
        SIZE_MIN, // When qt_mat_fund_ai is 0, radius is 6
        ['$max', ['$get', 'view.metadata.sizingValues']],
        SIZE_MAX, // When qt_mat_fund_ai is 100, radius is 20
      ]
    : SIZE_DEFAULT

  const $tooltip = {
    title: [
      '$literal',
      [
        '$join',
        [
          ['$get', 'feature.properties.ds_tipo_estabelecimento'],
          ['$get', 'feature.properties.no_logradouro'],
        ],
        ' | ',
      ],
    ],
    entries: [
      [
        indicator_label,
        ['$literal', ['$get', `feature.properties.${VARIABLE_ID}::string`]],
      ],
      dynamic_sizing
        ? [
            ['$get', 'view.conf.data.sizingVariable'],
            [
              '$literal',
              [
                '$get',
                [
                  '$template',
                  'feature.properties.${0}::string',
                  ['$get', 'view.conf.data.sizingVariable'],
                ],
              ],
            ],
          ]
        : null,
    ].filter(Boolean),
  }

  const $legends = dynamic_sizing
    ? [
        {
          type: 'ProportionalSymbolLegend',
          // unit: 'Matrículas',
          title: ['$get', 'view.conf.data.sizingVariable'],
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

  return typeParser(base, { ...config, $circleRadius, $tooltip, $legends })
}
