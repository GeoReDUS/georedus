import { get } from 'lodash'
import {
  ABOVE_BASE_MAP_LAYERS_Z_INDEX_BASE,
  COLOR_SCHEMES,
  vectorLayer,
  zoomSensitiveLinearSizes,
} from '../../util'

export function numerical_size(
  base,
  {
    collection_id,
    variable_id,
    indicator_label,
    color_scheme = 'schemeSet1.colors[1]',
    measure_unit,
    $tooltip,
    $layerFilter,
  },
) {
  const VARIABLE_ID = variable_id
  const TABLE_ID = collection_id
  const VECTOR_SOURCE_ID = `${TABLE_ID}.geom`

  const SIZE_MAX = 25
  const SIZE_MIN = 6

  return {
    ...base,
    layers: {
      ...base.layers,
      [`${VECTOR_SOURCE_ID}_circle`]: vectorLayer(VECTOR_SOURCE_ID, {
        zIndex: ABOVE_BASE_MAP_LAYERS_Z_INDEX_BASE + 2,
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
        tooltip: $tooltip,

        filter: $layerFilter,

        paint: {
          'circle-opacity': 1,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#000000',

          'circle-radius': [
            '$if',
            [
              '$gt',
              ['$get', 'length', ['$get', 'view.metadata.variableValues']],
              1,
            ],
            zoomSensitiveLinearSizes({
              variable: ['get', VARIABLE_ID],
              minValue: ['$min', ['$get', 'view.metadata.variableValues']],
              maxValue: ['$max', ['$get', 'view.metadata.variableValues']],
              minSize: SIZE_MIN,
              maxSize: SIZE_MAX,
            }),

            10,
          ],

          'circle-color': get(COLOR_SCHEMES, color_scheme) || color_scheme,
        },
      }),
    },
  }
}
