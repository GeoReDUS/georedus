import { get } from 'lodash'
import {
  vectorLayer,
  COLOR_SCHEMES,
  DEFAULT_NULL_COLOR,
  ABOVE_BASE_MAP_LAYERS_Z_INDEX_BASE,
} from '../../util'

export function categorical(
  base,
  {
    collection_id,
    measure_unit,
    variable_id,
    indicator_label,
    categories,
    $legends,
    $tooltip,
    $layerFilter,
    $circleRadius,
  },
) {
  const VARIABLE_ID = variable_id
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
    layers: {
      ...base.layers,
      [`${VECTOR_SOURCE_ID}_circle`]: vectorLayer(VECTOR_SOURCE_ID, {
        // zIndex: ABOVE_BASE_MAP_LAYERS_Z_INDEX_BASE + 2,
        type: 'circle',

        legends: [
          ...(categories
            ? [
                {
                  type: 'ColorLegend',
                  title: indicator_label,
                  unit: measure_unit,
                  items: categories,
                },
              ]
            : []),
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
