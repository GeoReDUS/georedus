import {
  flatten,
  union,
  booleanIntersects,
  featureCollection,
} from '@turf/turf'

export function dissolveAreasPreservingIsolated(geojson) {
  let features = flatten(geojson).features.filter(Boolean)
  let changed = true

  // Keep merging until nothing changes
  while (changed) {
    changed = false
    const merged = []
    const used = new Array(features.length).fill(false)

    for (let i = 0; i < features.length; i++) {
      if (used[i]) continue
      let current = features[i]
      let mergedSomething = false

      for (let j = i + 1; j < features.length; j++) {
        if (used[j]) continue
        if (booleanIntersects(current, features[j])) {
          const result = union(featureCollection([current, features[j]]))
          if (result) {
            current = result
            used[j] = true
            mergedSomething = true
            changed = true
          }
        }
      }

      used[i] = true
      merged.push(current)
    }

    features = merged
  }

  return featureCollection(features)
}
