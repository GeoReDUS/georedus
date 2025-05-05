import { buffer as turfBuffer } from '@turf/turf'
import { dissolveAreasPreservingIsolated } from './dissolveAreasPreservingIsolated'

type TurfBufferOptions = Parameters<typeof turfBuffer>[2]
type BufferOptions = TurfBufferOptions & {
  dissolve?: boolean
}

function _applyBufferToGeometry(
  geometry: GeoJSON.Geometry,
  radius: number,
  options?: TurfBufferOptions,
) {
  switch (geometry?.type) {
    case 'Point': {
      return turfBuffer(geometry, radius, options)?.geometry || null
    }
    case 'LineString': {
      return turfBuffer(geometry, radius, options)?.geometry || null
    }
    default: {
      return geometry
    }
  }
}

export function buffer(
  geoJson: GeoJSON.FeatureCollection,
  radius: number,
  { dissolve = false, ...turfBufferOptions }: BufferOptions = {},
): GeoJSON.FeatureCollection {
  const withBuffer = {
    ...geoJson,
    features: geoJson.features.map((feature) => {
      try {
        const geomWithBuffer = _applyBufferToGeometry(
          feature.geometry,
          radius,
          turfBufferOptions,
        )

        return {
          ...feature,
          geometry: geomWithBuffer ? geomWithBuffer : feature.geometry,
        }
      } catch (err) {
        console.error(
          'error applying buffer, will return unmodified feature',
          err,
          feature,
        )

        return feature
      }
    }),
  }

  return dissolve ? dissolveAreasPreservingIsolated(withBuffer) : withBuffer
}
