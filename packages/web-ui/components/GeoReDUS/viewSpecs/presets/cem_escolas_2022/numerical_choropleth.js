import { vectorLayer, COLOR_SCHEMES } from '../../util'

export function numerical_choropleth(
  base,
  {
    collection_id,
    indicator_id,
    indicator_label,
    color_scheme = 'schemeRdYlBu',
    filter,
    measure_unit,

    $circleRadius,
    $tooltip,
    $legends,
  },
) {
  const VARIABLE_ID = indicator_id
  const TABLE_ID = collection_id
  const VECTOR_SOURCE_ID = `${TABLE_ID}.geom`

  // const viewId = `${collection_id}.${VARIABLE_ID}`

  const _color_scheme = COLOR_SCHEMES[color_scheme]

  return {
    ...base,
    debug: true,
    metadata: [
      '$let',
      base.metadata,
      {
        variableValues: ['$get', 'variableValues'],
        sizingValues: ['$get', 'sizingValues'],
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

    layers: {
      ...base.layers,
      [`${VECTOR_SOURCE_ID}_circle`]: vectorLayer(VECTOR_SOURCE_ID, {
        type: 'circle',

        legends: [
          {
            type: 'SequentialColorLegend',
            title: indicator_label,
            unit: measure_unit,
            steps: ['$get', 'view.metadata.colorScaleStops'],
          },
          ...$legends,
        ],
        interactive: true,
        tooltip: $tooltip,
        // tooltip: {
        //   title: ['$literal', ['$get', 'feature.properties.no_entidade']],
        //   entries: [
        //     [
        //       indicator_label,
        //       [
        //         '$literal',
        //         [
        //           '$get',
        //           `feature.properties.${VARIABLE_ID}::string({ "number": ["pt-BR"] })`,
        //         ],
        //       ],
        //     ],
        //   ],
        // },
        filter: [
          'all',
          ['==', ['get', 'co_municipio'], ['$get', 'municipioId']],
          ['==', ['typeof', ['get', VARIABLE_ID]], 'number'],
          ...(Array.isArray(filter) ? filter : []),
        ],
        paint: {
          'circle-opacity': 1,
          'circle-radius': $circleRadius,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#efefef',
          'circle-color': [
            '$flat',
            [
              ['step', ['get', VARIABLE_ID]],
              ['$get', 'view.metadata.colorScaleStops'],
            ],
          ],
        },
      }),
    },
  }
}
