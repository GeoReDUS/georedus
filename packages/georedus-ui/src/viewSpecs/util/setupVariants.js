export function setupVariants(viewSpec, allViewSpecs) {
  const variants = [
    viewSpec,
    ...allViewSpecs.filter(
      (otherViewSpec) => otherViewSpec.variant_of === viewSpec.indicator_id,
    ),
  ]

  const variantsById = Object.fromEntries(
    variants.map((variant) => [variant.indicator_id, variant]),
  )

  function loadVariant(id) {
    const variantSpec = variantsById[id]

    if (!variantSpec) {
      console.warn(`could not find corresponding variant spec ${id}`)
      return null
    }

    const mainSpec = variantSpec.variant_of
      ? variantsById[variantSpec.variant_of]
      : null
    return mainSpec ? { ...mainSpec, ...variantSpec } : variantSpec
  }

  return {
    variants,
    variantsById,
    loadVariant,
  }
}
