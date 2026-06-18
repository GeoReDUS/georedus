import { MAIN_SOURCE_ID } from './sources'

export function layers(viewSpec, allViewSpecs, context) {
  const styleSpec = viewSpec.style

  return {
    [`main_raster`]: {
      minzoom: 9,
      // zIndex: 10,
      type: 'raster',
      source: MAIN_SOURCE_ID,
      paint: {
        'raster-opacity': 0.85,
      },
      legends: [
        {
          type: 'CategoricalLegend',
          title: viewSpec.label,
          items: viewSpec.style.categories,
        },
      ],
    },
  }
}
