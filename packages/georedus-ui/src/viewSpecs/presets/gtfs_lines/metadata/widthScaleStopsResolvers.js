import { scaleQuantile } from 'd3-scale'
import { ckmeans } from 'simple-statistics'

function _validNumericalValues(values) {
  return values.filter((v) => typeof v === 'number' && !Number.isNaN(v))
}

function _naturalBreakBounds(values, k) {
  const groups = ckmeans(values, k)
  return groups.map((group) => [group[0], group[group.length - 1]])
}

function _sizeForIndex(index, count, sizeMin, sizeMax) {
  return count > 1 ? sizeMin + ((sizeMax - sizeMin) * index) / (count - 1) : sizeMax
}

function equalIntervals({ values, classificationMethod, sizeMin, sizeMax }) {
  const k = classificationMethod.k
  const validValues = _validNumericalValues(values)
  const min = Math.min(...validValues)
  const max = Math.max(...validValues)

  const breaks = new Array(k - 1)
    .fill(null)
    .map((_, index) => min + ((max - min) * (index + 1)) / k)

  const stops = [sizeMin]
  breaks.forEach((breakValue, index) => {
    const size = _sizeForIndex(index + 1, k, sizeMin, sizeMax)
    stops.push(breakValue, size)
  })

  return stops
}

function quantile({ values, classificationMethod, sizeMin, sizeMax }) {
  const k = classificationMethod.k
  const validValues = _validNumericalValues(values)
  const scale = scaleQuantile()
    .domain(validValues)
    .range(new Array(k).fill(null).map((_, idx) => idx))

  const breaks = scale.quantiles()

  const stops = [sizeMin]
  let previousEdge = -Infinity
  breaks.forEach((breakValue, index) => {
    if (breakValue <= previousEdge) {
      return
    }
    const size = _sizeForIndex(index + 1, k, sizeMin, sizeMax)
    stops.push(breakValue, size)
    previousEdge = breakValue
  })

  return stops
}

function naturalBreaks({ values, classificationMethod, sizeMin, sizeMax }) {
  const validValues = _validNumericalValues(values)
  const bounds = _naturalBreakBounds(validValues, classificationMethod.k)

  const stops = [sizeMin]
  let previousEdge = -Infinity
  bounds.forEach(([min], index) => {
    if (min <= previousEdge) {
      return
    }
    const size = _sizeForIndex(index, bounds.length, sizeMin, sizeMax)
    stops.push(min, size)
    previousEdge = min
  })

  return stops
}

export const WIDTH_SCALE_STOPS_RESOLVERS = {
  equalIntervals,
  quantile,
  naturalBreaks,
}
