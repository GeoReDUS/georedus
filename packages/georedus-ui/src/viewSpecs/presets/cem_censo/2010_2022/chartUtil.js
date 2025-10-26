import { COLOR_SCHEMES, downloadResolver, globalResources } from '../../../util'

export const INSUFFICIENT_DATA_COLOR = 'red'

export function chartUtil(viewSpec, allViewSpecs, context) {
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

  const NUMBER_FMT = [
    '$if',
    ['$endsWith', ['$get', 'view.conf.data.variableId'], '_pct'],
    ['pt-BR', { style: 'percent' }],
    ['pt-BR', {}],
  ]

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

      //
      // TODO: review! Clearly not structured manner.
      // Currently used @ GeoReDUS/GeoReDUS.jsx
      //
      __filterFeaturesForStep: (stepInfo, features) => {
        return features.filter((feature) => {
          const value = feature.properties?.[variable_id]

          return (
            typeof value === 'number' &&
            value >= stepInfo.min &&
            (value <= stepInfo.max || stepInfo.max === null)
          )
        })
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

  return {
    NUMBER_FMT,
    _color_scheme,
    _legends,
    _variableValueTooltipEntry,
  }
}
