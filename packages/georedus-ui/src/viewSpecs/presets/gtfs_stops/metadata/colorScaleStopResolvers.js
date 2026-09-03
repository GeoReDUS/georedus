import { scaleQuantile, scaleThreshold } from 'd3-scale'
import { range } from 'd3-array'

const DEFAULT_COLOR = '#CCC'

// Will distribute only values above 1 in all resolvers types

function equalIntervals({ values, colorScheme, classificationMethod }) {
  const hasLowerValues = Math.min(...values) < 1
  const k = hasLowerValues ? classificationMethod.k - 1 : classificationMethod.k
  const valuesAbove1 = values.filter((v) => v >= 1)
  const min = Math.min(...valuesAbove1)
  const max = Math.max(...valuesAbove1)
  const colorScale = colorScheme.scalesByK[k]

  const breaks = new Array(k - 1)
    .fill(null)
    .map((_, index) => min + ((max - min) * (index + 1)) / k)

  const colorScaleStops = breaks
    .map((breakValue, index) => {
      const color = colorScale[index + 1]
      return index === 0
        ? [DEFAULT_COLOR, min, colorScale[0], breakValue, color]
        : [breakValue, color]
    })
    .flat(1)

  return { colorScaleStops, hasLowerValues }
}

function quantile({ values, colorScheme, classificationMethod }) {
  const hasLowerValues = Math.min(...values) < 1
  const k = hasLowerValues ? classificationMethod.k : classificationMethod.k + 1
  const valuesAbove1 = values.filter((v) => v >= 1)

  let raw = scaleQuantile().domain(valuesAbove1).range(range(k)).quantiles()

  const breaks = [...new Set(raw)]

  const colorScale = colorScheme.scalesByK[k]
  const colorScaleStops = hasLowerValues
    ? breaks
        .map((breakValue, index) => {
          const color = colorScale[index + 1]

          return index === 0
            ? [DEFAULT_COLOR, breakValue, color]
            : [breakValue, color]
        })
        .flat(1)
    : [
        DEFAULT_COLOR,
        ...breaks.flatMap((breakValue, index) => [
          breakValue,
          colorScale[index],
        ]),
      ]
  return { colorScaleStops, hasLowerValues }
}

function naturalBreaks({ values, colorScheme, classificationMethod }) {
  const valuesAbove1 = values.filter((v) => v >= 1)
  const hasLowerValues = Math.min(...values) < 1
  const k = hasLowerValues ? classificationMethod.k - 1 : classificationMethod.k
  const colorScaleStops = [
    '$naturalBreaks',
    valuesAbove1,
    {
      ...colorScheme,
      defaultColor: DEFAULT_COLOR,
      k,
    },
  ]
  return { colorScaleStops, hasLowerValues }
}

export const COLOR_SCALE_STOPS_RESOLVERS = {
  equalIntervals,
  quantile,
  naturalBreaks,
}
