// import {
//   flatten,
//   union,
//   booleanIntersects,
//   featureCollection,
// } from '@turf/turf'

// /**
//  * Dissolves overlapping features into groups and returns a FeatureCollection,
//  * preserving non-overlapping features as-is.
//  *
//  * @param {Object} geojson - A FeatureCollection of Polygon or MultiPolygon features.
//  * @returns {Object} A new FeatureCollection with dissolved groups.
//  */
// export function dissolveAreasPreservingIsolated(geojson) {
//   const features = flatten(geojson).features.filter(Boolean)
//   const used = new Array(features.length).fill(false)
//   const dissolvedGroups = []

//   for (let i = 0; i < features.length; i++) {
//     if (used[i]) continue

//     const group = [features[i]]
//     used[i] = true

//     for (let j = i + 1; j < features.length; j++) {
//       if (used[j]) continue

//       if (group.some((f) => f && booleanIntersects(f, features[j]))) {
//         group.push(features[j])
//         used[j] = true
//       }
//     }

//     if (group.length === 1) {
//       dissolvedGroups.push(group[0])
//     } else {
//       let merged = group[0]

//       for (let k = 1; k < group.length; k++) {
//         if (!merged || !group[k]) continue

//         const result = union(featureCollection([merged, group[k]]))

//         if (!result) {
//           console.warn(`⚠️ Skipped invalid union at index ${i}, ${k}`)
//           continue
//         }

//         merged = result
//       }

//       if (merged) {
//         dissolvedGroups.push(merged)
//       }
//     }
//   }

//   return featureCollection(dissolvedGroups)
// }

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

