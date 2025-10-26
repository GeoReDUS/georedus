import { uniqBy } from 'lodash'

export function parseSchema(viewSpec, allViewSpecs, context) {
  const {
    collection_id,
    // source_table_id,
    indicator_path,
    indicator_id,
    indicator_label,
    year = collection_id.endsWith('2010') ? '2010' : '2022',
    variable_id,
    metodology,
    keywords,
    variant_label,
    // measure_unit,
    // variable_id_pct,
    variant_path,
    // description,
    // preset,
  } = viewSpec

  if (variable_id !== indicator_id) {
    //
    // Filter out variants
    //
    return null
  }
  const viewId = `${collection_id}.${variable_id}`

  const variants = uniqBy(
    allViewSpecs.filter(
      (otherViewSpec) => otherViewSpec.indicator_id === indicator_id,
    ),
    (viewSpec) => viewSpec.variable_id,
  )

  const variantsByVariableId = Object.fromEntries(
    variants.map((variant) => [variant.variable_id, variant]),
  )

  const labels = Object.fromEntries(
    variants.map((variant) => [
      variant.variable_id,
      [
        variant.variable_id === indicator_id
          ? indicator_label
          : [indicator_label, variant.variant_label].join(' | '),
        year ? `(${year})` : null,
      ]
        .filter(Boolean)
        .join(' '),
    ]),
  )

  const measureUnits = Object.fromEntries(
    variants.map((variant) => [variant.variable_id, variant.measure_unit]),
  )

  const sourceLabel = `CENSO ${year}`

  return {
    viewId,
    path: indicator_path,
    label: indicator_label,
    metodology,
    keywords: [
      indicator_path,
      sourceLabel,
      variant_path,
      variant_label,
      variable_id,
      keywords,
    ].filter(Boolean),
    year,
    variants,
    variantsByVariableId,
    labels,
    measureUnits,
    sourceLabel,
  }
}
