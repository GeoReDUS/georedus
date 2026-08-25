import { scaleQuantile } from 'd3-scale'

const DEFAULT_COLOR = '#CCC'



// function linear({values, colorScheme, classificationMethod}) {
  
// }

function quantile({ values, colorScheme, classificationMethod }) {
  const scale = scaleQuantile()
    .domain(values) // your data
    .range(new Array(classificationMethod.k).fill(null).map((_, idx) => idx)) // number of bins

  const breaks = scale.quantiles() // → the cutoff values

  //
  // Will produce an array such as:
  // [
  //   "below_10",
  //   10,
  //   "between_10_20",
  //   20,
  //   "between_20_30",
  //   30,
  //   "above_30"
  // ]
  //

  const colorScale = colorScheme.scalesByK[classificationMethod.k]
  const colorScaleStops = breaks
    .map((breakValue, index) => {
      const color = colorScale[index + 1]

      return index === 0
        ? [
            // For below 0 values, will use defaultColor
            DEFAULT_COLOR,
            0,
            // colorScale
            colorScale[0],
            breakValue,
            color,
          ]
        : [breakValue, color]
    })
    .flat(1)

  return colorScaleStops
}

function naturalBreaks({ values, colorScheme, classificationMethod }) {
  return [
    '$naturalBreaks',
    values,
    {
      ...colorScheme,
      defaultColor: DEFAULT_COLOR,
      k: classificationMethod.k,
      minK: 5,
    },
  ]
}

export const COLOR_SCALE_STOPS_RESOLVERS = {
  // linear,
  quantile,
  naturalBreaks,
}
