//
// Formats the filter to be a compatible searchParams for fetching
// data at METADATA_API
//
export function fmtMetadataApiFilterExp(filter) {
  const COMPARATOR_DICT = {
    in: 'in',
    '==': 'eq',
    '>': 'gt',
    '<': 'lt',
    '>=': 'gte',
    '<=': 'lte',
  }

  return Object.fromEntries(
    Object.entries(filter).map(([key, [comparator, targetValue]]) => {
      const cmp = COMPARATOR_DICT[comparator]

      switch (cmp) {
        case 'in': {
          return [key, `${cmp}.(${targetValue.join(',')})`]
        }
        default: {
          return [key, `${cmp}.${targetValue + ''}`]
        }
      }
    }),
  )
}

//
// Formats filter into compatible version relative to maplibre gl
// AND
//
export function fmtMaplibreGlFilterExp(filter) {
  const COMPARATOR_DICT = {
    in: 'in',
    '==': '==',
    '>': '>',
    '<': '<',
    '>=': '>=',
    '<=': '<=',
  }

  return Object.entries(filter).map(([key, [comparator, targetValue]]) => {
    const cmp = COMPARATOR_DICT[comparator]
    if (!cmp) {
      throw new Error(`compartor "${cmp}" not supported`)
    }

    return [
      cmp,
      ['get', key],
      Array.isArray(targetValue) ? ['literal', targetValue] : targetValue,
    ]
  })
}
