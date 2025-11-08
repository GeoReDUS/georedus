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
    indicator_id,
    variable_id,
    indicator_label,
    categories,
    filter,
    $circleRadius,
    $tooltip,
    $legends,
    $layerFilter,
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

  const $circleColor = categories
    ? [
        'match',
        ['to-string', ['get', VARIABLE_ID]],
        ...categories.flatMap((category) => [category.value, category.color]),
        DEFAULT_NULL_COLOR,
      ]
    : DEFAULT_NULL_COLOR

  return {
    ...base,
    layers: {
      ...base.layers,

      influenceArea_fill: {
        ...base.layers.influenceArea_fill,
        paint: {
          ...base.layers.influenceArea_fill.paint,
          'fill-color': $circleColor,
        },
      },
      influenceArea_boundaries: {
        ...base.layers.influenceArea_boundaries,
        paint: {
          ...base.layers.influenceArea_boundaries.paint,
          'line-color': $circleColor,
        },
      },

      [`${VECTOR_SOURCE_ID}_circle`]: vectorLayer(VECTOR_SOURCE_ID, {
        // zIndex: ABOVE_BASE_MAP_LAYERS_Z_INDEX_BASE + 2,
        type: 'circle',

        legends: [
          categories
            ? {
                type: 'ColorLegend',
                title: indicator_label,
                items: categories,

                // unit: measure_unit,
                // steps: ['$get', 'view.metadata.colorScaleStops'],
              }
            : null,
          ...$legends,
        ],
        // legends: [
        //   {
        //     type: 'SequentialColorLegend',
        //     title: indicator_label,
        //     unit: measure_unit,
        //     steps: ['$get', 'view.metadata.colorScaleStops'],
        //   },
        // ],
        interactive: true,
        tooltip: $tooltip,
        filter: $layerFilter,
        // filter: [
        //   'all',
        //   [
        //     '==',
        //     ['get', 'id_municipio_gestor'],
        //     ['$substr', ['$get', 'municipioId'], 0, 6],
        //   ],
        //   ...(Array.isArray(filter) ? filter : []),
        // ],
        paint: {
          'circle-opacity': 1,
          'circle-radius': 10,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#000000',
          'circle-radius': $circleRadius,
          'circle-color': $circleColor,
        },
      }),
    },
  }
}
