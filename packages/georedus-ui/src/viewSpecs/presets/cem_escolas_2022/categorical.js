import { get } from 'lodash'
import { vectorLayer, COLOR_SCHEMES, DEFAULT_NULL_COLOR } from '../../util'
import { Z_OVERLAY_MIDDLE_2000 } from '../../zIndexes'

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
        zIndex: Z_OVERLAY_MIDDLE_2000 + 1,
        type: 'circle',

        legends: [
          ...(categories
            ? [
                {
                  type: 'CategoricalLegend',
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
