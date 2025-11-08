import {
  vectorLayer,
  COLOR_SCHEMES,
  ABOVE_BASE_MAP_LAYERS_Z_INDEX_BASE,
} from '../../util'

const INSUFFICIENT_DATA_COLOR = '#cccccc'

export function numerical_choropleth(
  base,
  {
    collection_id,
    variable_id,
    indicator_label,
    number_format,
    color_scheme = 'schemeRdYlBu',
    measure_unit,

    $circleRadius,
    $tooltip,
    $layerFilter,
    $legends,
  },
) {
  const TABLE_ID = collection_id
  const VECTOR_SOURCE_ID = `${TABLE_ID}.geom`

  const _color_scheme = COLOR_SCHEMES[color_scheme]

  const $circleColor = [
    '$if',
    ['$empty', ['$get', 'view.metadata.colorScaleStops']],
    INSUFFICIENT_DATA_COLOR,
    [
      '$flat',
      [
        ['step', ['coalesce', ['get', variable_id], -1]],
        ['$get', 'view.metadata.colorScaleStops'],
      ],
    ],
  ]

  return {
    ...base,
    metadata: {
      _value: [
        '$let',
        base.metadata._value,
        {
          variableValues: ['$get', 'variableValues'],
          sizingValues: ['$get', 'sizingValues'],
          influenceArea: ['$get', 'influenceArea'],
          colorScaleStops: [
            '$naturalBreaks',
            ['$get', 'variableValues'],
            [
              '$merge',
              _color_scheme,
              {
                minK: 5,
              },
            ],
          ],
        },
      ],
    },

    layers: {
      ...base.layers,
      [`${VECTOR_SOURCE_ID}_circle`]: vectorLayer(VECTOR_SOURCE_ID, {
        // zIndex: ABOVE_BASE_MAP_LAYERS_Z_INDEX_BASE + 2,
        type: 'circle',

        legends: [
          {
            type: 'SequentialColorLegend',
            title: indicator_label,
            unit: measure_unit,
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
              number: number_format || ['pt-BR', {}],
              below: 'Sem dados',
              above: [
                '$if',
                ['$empty', ['$get', 'view.metadata.colorScaleStops']],
                null,
                'Acima de ${0}',
              ],
            },
          },
          ...$legends,
        ],
        interactive: true,
        tooltip: $tooltip,
        filter: $layerFilter,
        paint: {
          'circle-opacity': 1,
          'circle-radius': $circleRadius,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#000000',
          'circle-color': $circleColor,
        },
      }),

      influenceArea_fill: {
        ...base.layers.influenceArea_fill,
        paint: {
          ...base.layers.influenceArea_fill.paint,
          'fill-color': $circleColor,
        },
      },
    },
  }
}
