export function buildHourlyFieldNames(valueKey) {
  const fields = []
  for (let i = 0; i < 24; i++) {
    fields.push(
      `${valueKey}_${String(i).padStart(2, '0')}_${String(i + 1).padStart(2, '0')}`
    )
  }
  return fields
}

const MAX_AGGREGATION_KEYS = ['linhas']

export function isMaxAggregationKey(valueKey) {
  return MAX_AGGREGATION_KEYS.includes(valueKey)
}

export function buildPeriodValueExpression(valueKey, periodFrom, periodTo) {
  const fields = buildHourlyFieldNames(valueKey).slice(periodFrom, periodTo)
  const sumExpr = ['+', ...fields.map((f) => ['coalesce', ['get', f], 0])]
  return ['/', sumExpr, fields.length]
}

export function buildPeriodMaxExpression(valueKey, periodFrom, periodTo) {
  const fields = buildHourlyFieldNames(valueKey).slice(periodFrom, periodTo)
  return ['max', ...fields.map((f) => ['coalesce', ['get', f], 0])]
}

export function buildPeriodExpression(valueKey, periodFrom, periodTo) {
  return isMaxAggregationKey(valueKey)
    ? buildPeriodMaxExpression(valueKey, periodFrom, periodTo)
    : buildPeriodValueExpression(valueKey, periodFrom, periodTo)
}

export function buildPeriodFrequencyExpression(valueKey, periodFrom, periodTo) {
  const fields = buildHourlyFieldNames(valueKey).slice(periodFrom, periodTo)
  const sumExpr = ['+', ...fields.map((f) => {
    const headway = ['coalesce', ['get', f], 0]
    return ['case', ['==', headway, 0], 0, ['/', 60, headway]]
  })]
  return ['/', sumExpr, fields.length]
}

export function computePeriodValue(getValue, valueKey, periodFrom, periodTo) {
  const slice = buildHourlyFieldNames(valueKey)
    .slice(periodFrom, periodTo)
    .map((field) => getValue(field) || 0)

  return isMaxAggregationKey(valueKey)
    ? Math.max(...slice)
    : slice.reduce((acc, v) => acc + v, 0) / (periodTo - periodFrom)
}

export function formatHour(fraction) {
  const h = Math.round(fraction)
  return `${String(h).padStart(2, '0')}:00`
}