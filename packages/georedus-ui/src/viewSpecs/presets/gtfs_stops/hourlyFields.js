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
