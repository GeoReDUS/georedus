import { MAIN_SOURCE_ID } from './sources'

const DEFAULT_RASTER_FILL_OPACITY = 0.7

export function layers(viewSpec, allViewSpecs, context) {
  const categories = viewSpec.style.categories

  const _legends = [
    {
      type: 'CategoricalLegend',
      title: viewSpec.label,
      items: categories.map((cat) => ({
        id: cat.value,
        label: cat.label || cat.value,
        color: cat.color,
        box: {
          style: {
            backgroundColor: cat.color,
          },
        },
      })),
    },
  ]

  return {
    [`main_raster`]: {
      minzoom: 3,
      type: 'raster',
      source: MAIN_SOURCE_ID,
      paint: {
        'raster-opacity': DEFAULT_RASTER_FILL_OPACITY,
      },
      legends: _legends,
    },
  }
}
