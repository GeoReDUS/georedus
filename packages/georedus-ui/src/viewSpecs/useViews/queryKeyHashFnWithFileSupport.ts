//
// Custom queryKeyHashFn that correctly handles files
//
// https://github.com/TanStack/query/blob/ff788ac4e0a9cbc6af6cdf1837fcbf5c0b0b9a9c/packages/query-core/src/utils.ts#L217

import type { QueryKey } from '@tanstack/react-query'
import { isPlainObject } from 'lodash'

export function queryKeyHashFnWithFileSupport(queryKey: QueryKey) {
  return JSON.stringify(queryKey, (_, val) => {
    if (val instanceof File) {
      // Replace File with stable metadata representation
      return {
        __file__: true,
        name: val.name,
        size: val.size,
        type: val.type,
        lastModified: val.lastModified,
      }
    }

    return isPlainObject(val)
      ? Object.keys(val)
          .sort()
          .reduce(
            (result, key) => {
              result[key] = val[key]
              return result
            },
            {} as Record<string, any>,
          )
      : val
  })
}
