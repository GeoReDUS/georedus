import { resolveAsync } from '@orioro/resolve'
import { defaultMetadata } from './defaultMetadata'
import { customGeoJSON_metadata } from '../customGeoJson'

export * from './util'

export function metadata(opts) {
  return resolveAsync.fn(async (context) => {
    if (context.view?.conf?.data?.customSpatialAggregationUnit) {
      return await customGeoJSON_metadata(opts, context)
    } else {
      return await defaultMetadata(opts, context)
    }
  })
}
