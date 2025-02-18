import { get } from 'lodash'
import { COLOR_SCHEMES, vectorLayer } from '../../util'

export function numerical_size(
  base,
  {
    collection_id,
    indicator_id,
    indicator_label,
    color_scheme = 'schemeSet1.colors[1]',
    filter,
    measure_unit,
  },
) {
  const VARIABLE_ID = indicator_id
  const TABLE_ID = collection_id
  const VECTOR_SOURCE_ID = `${TABLE_ID}.geom`

  return {
    ...base,
    layers: {
      ...base.layers,
      [`${VECTOR_SOURCE_ID}_circle`]: vectorLayer(VECTOR_SOURCE_ID, {
        type: 'circle',

        // legends: [
        //   {
        //     type: 'ColorLegend',
        //     title: indicator_label,
        //     items: [
        //       {
        //         color: 'green',
        //         label: 'Sim',
        //       },
        //       {
        //         color: 'red',
        //         label: 'Não',
        //       }
        //     ],

        //     // unit: measure_unit,
        //     // steps: ['$get', 'view.metadata.colorScaleStops'],
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
                [
                  '$get',
                  `feature.properties.${VARIABLE_ID}::string({ "number": ["pt-BR"] })`,
                ],
              ],
            ],
          ],
        },
        filter: [
          'all',
          ['==', ['get', 'co_municipio'], ['$get', 'municipioId']],
          ['==', ['typeof', ['get', VARIABLE_ID]], 'number'],
          ...(Array.isArray(filter) ? filter : []),
        ],
        paint: {
          'circle-opacity': 1,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#efefef',
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', VARIABLE_ID], // Replace "density" with your property name
            ['$min', ['$get', 'view.metadata.variableValues']],
            6, // When qt_mat_fund_ai is 0, radius is 6
            ['$max', ['$get', 'view.metadata.variableValues']],
            25, // When qt_mat_fund_ai is 100, radius is 20
          ],
          'circle-color': get(COLOR_SCHEMES, color_scheme) || color_scheme,
        },
      }),
    },
  }
}
