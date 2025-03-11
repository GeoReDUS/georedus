import { get } from 'lodash'
import { vectorLayer, COLOR_SCHEMES, DEFAULT_NULL_COLOR } from '../../util'

export function categorical(
  base,
  { collection_id, indicator_id, indicator_label, categories, filter },
) {
  const VARIABLE_ID = indicator_id
  const TABLE_ID = collection_id
  const VECTOR_SOURCE_ID = `${TABLE_ID}.geom`

  categories = categories
    ? categories.map((category) => ({
        ...category,
        color: get(COLOR_SCHEMES, category.color) || category.color,
      }))
    : null

  return {
    ...base,

    //
    // No need for metadata
    //
    metadata: {},
    layers: {
      ...base.layers,
      [`${VECTOR_SOURCE_ID}_circle`]: vectorLayer(VECTOR_SOURCE_ID, {
        type: 'circle',

        legends: categories
          ? [
              {
                type: 'ColorLegend',
                title: indicator_label,
                items: categories,

                // unit: measure_unit,
                // steps: ['$get', 'view.metadata.colorScaleStops'],
              },
            ]
          : null,
        // legends: [
        //   {
        //     type: 'SequentialColorLegend',
        //     title: indicator_label,
        //     unit: measure_unit,
        //     steps: ['$get', 'view.metadata.colorScaleStops'],
        //   },
        // ],
        interactive: true,
        tooltip: {
          title: ['$literal', ['$get', 'feature.properties.no_entidade']],
          entries: [
            [
              indicator_label,
              [
                '$literal',
                categories
                  ? [
                      '$get',
                      ['$get', `feature.properties.${VARIABLE_ID}::string`],
                      Object.fromEntries(
                        categories.map((category) => [
                          category.value,
                          category.label,
                        ]),
                      ),
                    ]
                  : ['$get', `feature.properties.${VARIABLE_ID}::string`],
              ],
            ],
          ],
        },
        filter: [
          'all',
          ['==', ['get', 'co_municipio'], ['$get', 'municipioId']],
          ...(Array.isArray(filter) ? filter : []),

          // ['==', ['typeof', ['get', VARIABLE_ID]], 'number'],
        ],
        paint: {
          'circle-opacity': 1,
          'circle-radius': 10,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#efefef',
          // 'circle-radius': [
          //   'interpolate',
          //   ['linear'],
          //   ['get', SIZING_VARIABLE_ID], // Replace "density" with your property name
          //   ['$min', ['$get', 'sizingValues']],
          //   6, // When qt_mat_fund_ai is 0, radius is 6
          //   ['$max', ['$get', 'sizingValues']],
          //   20, // When qt_mat_fund_ai is 100, radius is 20
          // ],
          // 'circle-radius': ['get', 'qt_mat_fund_ai'],
          'circle-color': categories
            ? [
                'match',
                ['to-string', ['get', VARIABLE_ID]],
                ...categories.flatMap((category) => [
                  category.value,
                  category.color,
                ]),
                DEFAULT_NULL_COLOR,
              ]
            : DEFAULT_NULL_COLOR,
        },
      }),
    },
  }
}
