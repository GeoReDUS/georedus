export function buildHourlyFieldNames(valueKey) {
  const fields = []
  for (let i = 0; i < 24; i++) {
    fields.push(
      `${valueKey}_${String(i).padStart(2, '0')}_${String(i + 1).padStart(2, '0')}`
    )
  }
  return fields
}

export function buildPeriodValueExpression(valueKey, periodFrom, periodTo) {
  const fields = buildHourlyFieldNames(valueKey).slice(periodFrom, periodTo)
  const sumExpr = ['+', ...fields.map((f) => ['coalesce', ['get', f], 0])]
  return ['/', sumExpr, fields.length]
}

export function buildPeriodFrequencyExpression(valueKey, periodFrom, periodTo) {
  const fields = buildHourlyFieldNames(valueKey).slice(periodFrom, periodTo)
  const sumExpr = ['+', ...fields.map((f) => {
    const headway = ['coalesce', ['get', f], 0]
    return ['case', ['==', headway, 0], 0, ['/', 60, headway]]
  })]
  return ['/', sumExpr, fields.length]
}

export function formatHour(fraction) {
  const h = Math.round(fraction)
  return `${String(h).padStart(2, '0')}:00`
}