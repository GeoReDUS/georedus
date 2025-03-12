import { get } from 'lodash'
import {
  ABOVE_BASE_MAP_LAYERS_Z_INDEX_BASE,
  COLOR_SCHEMES,
  vectorLayer,
} from '../../util'

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

  const SIZE_MAX = 25
  const SIZE_MIN = 6

  return {
    ...base,
    layers: {
      ...base.layers,
      [`${VECTOR_SOURCE_ID}_circle`]: vectorLayer(VECTOR_SOURCE_ID, {
        zIndex: ABOVE_BASE_MAP_LAYERS_Z_INDEX_BASE,
        type: 'circle',

        legends: [
          {
            type: 'ProportionalSymbolLegend',
            unit: measure_unit,
            title: indicator_label,
            min: ['$min', ['$get', 'view.metadata.variableValues']],
            max: ['$max', ['$get', 'view.metadata.variableValues']],
            sizeMin: SIZE_MIN * 2,
            sizeMax: SIZE_MAX * 2,
            numberFormat: ['pt-BR', { maximumFractionDigits: 0 }],
          },
        ],
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
            SIZE_MIN, // When qt_mat_fund_ai is 0, radius is 6
            ['$max', ['$get', 'view.metadata.variableValues']],
            SIZE_MAX, // When qt_mat_fund_ai is 100, radius is 20
          ],
          'circle-color': get(COLOR_SCHEMES, color_scheme) || color_scheme,
        },
      }),
    },
  }
}
