import { VectorTile, VectorTileLayer } from '@mapbox/vector-tile'
import Protobuf from 'pbf'
import { fromGeojsonVt } from 'vt-pbf'
import {
  JsonVectorTile,
  JsonVectorTileFeature,
  JsonVectorTileLayer,
} from './types'
import { arrayLikeIterable } from '@orioro/util'

export function* lazyFeatureGenerator(
  layer: VectorTileLayer,
): Generator<JsonVectorTileFeature> {
  for (let i = 0; i < layer.length; i++) {
    const feature = layer.feature(i)

    if (feature.type < 1 || feature.type > 3) {
      console.warn(`Skipping invalid feature type ${feature.type}`)
      continue
    }

    const rawGeometry = feature.loadGeometry()
    const geometry = rawGeometry.map((ring) => ring.map((pt) => [pt.x, pt.y]))

    const baseFeat: JsonVectorTileFeature = {
      id: feature.id,
      type: feature.type as JsonVectorTileFeature['type'],
      geometry: (feature.type === 1
        ? (geometry[0] as unknown as JsonVectorTileFeature['geometry'])
        : geometry) as JsonVectorTileFeature['geometry'],
      properties: feature.properties,
    }

    yield baseFeat
  }
}

type VtLayerTransformer = (
  layer: VectorTileLayer,
  ctx: {
    tile: VectorTile
  },
) => JsonVectorTileLayer

export function vtLayerTransform(
  layer: VectorTileLayer,
  ctx: { tile: VectorTile },
  transformer: VtLayerTransformer | null = null,
): JsonVectorTileLayer {
  const baseLayer: JsonVectorTileLayer = {
    name: layer.name,
    version: layer.version,
  }

  Object.defineProperty(baseLayer, 'features', {
    get() {
      return arrayLikeIterable(() => lazyFeatureGenerator(layer))
    },
  })

  // If transformer is a function, it receives a fully constructed layer (with lazy features)
  const transformed =
    typeof transformer === 'function' ? transformer(baseLayer, ctx) : baseLayer

  return transformed
}

export function transformAllLayers(
  transformer: VtLayerTransformer,
): Record<string, VtLayerTransformer> {
  return new Proxy(
    {},
    {
      get(_, layerName: string) {
        return transformer
      },
      has() {
        return true
      },
    },
  )
}

type VtTileTransformer =
  | ((tile: VectorTile) => JsonVectorTile)
  | Record<string, VtLayerTransformer>

export function vtTransform(
  input: ArrayBuffer | Buffer | VectorTile,
  transformer: VtTileTransformer,
) {
  const tile =
    input instanceof VectorTile ? input : new VectorTile(new Protobuf(input))

  const ctx = { tile }
  let result: JsonVectorTile = {}

  if (typeof transformer === 'function') {
    result = transformer(tile)
  } else {
    for (const srcLayerName in tile.layers) {
      const layerTransformer = transformer[srcLayerName] || null
      const resultLayer = vtLayerTransform(
        tile.layers[srcLayerName],
        ctx,
        layerTransformer,
      )

      result[resultLayer.name] = {
        ...resultLayer,
        features: (Array.isArray(resultLayer.features)
          ? resultLayer.features
          : [...resultLayer.features]
        ).map((feat) => ({
          ...feat,
          //
          // To conform to fromGeojsonVt API
          //
          tags: feat.properties,
        })),
      }
    }
  }

  return fromGeojsonVt(result)
}
