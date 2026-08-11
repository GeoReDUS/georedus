import { scaleQuantile } from 'd3-scale'


const DEFAULT_COLOR = '#CCC'

function custom({ values, colorScheme, classificationMethod }) {
  const k = classificationMethod.breaks.length
  return [
   DEFAULT_COLOR,
    ...classificationMethod.breaks
      .map((breakValue, index) => {
        return [breakValue, colorScheme.scalesByK[k][index]]
      })
      .flat(),
  ]
}

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

  // Para valores abaixo do mínimo de dados, será utilizada a cor padrão (defaultColor).
  const thresholds = [Math.min(...values), ...breaks]

  // MapLibre's "step" expression requires strictly ascending stops. Adjacent
  // thresholds can tie when a value repeats often in the data (e.g. many
  // zeros), so merge ties instead of emitting duplicate stops.
  const colorScaleStops = [DEFAULT_COLOR]
  thresholds.forEach((threshold, index) => {
    const color = colorScale[index]
    const lastThresholdIndex = colorScaleStops.length - 2

    if (
      lastThresholdIndex >= 0 &&
      colorScaleStops[lastThresholdIndex] === threshold
    ) {
      colorScaleStops[lastThresholdIndex + 1] = color
    } else {
      colorScaleStops.push(threshold, color)
    }
  })

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
  custom,
  quantile,
  naturalBreaks,
}
