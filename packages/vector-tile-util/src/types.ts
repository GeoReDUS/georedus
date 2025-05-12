export type JsonVectorTile = Record<string, JsonVectorTileLayer>

// 1 = Point
// 2 = LineString
// 3 = Polygon
export type GeometryType = 1 | 2 | 3

export type JsonVectorTileLayer = {
  version: number
  name: string
  features: JsonVectorTileFeature[]
}

export type JsonVectorTileFeature = {
  id?: number | string
  type: 1 | 2 | 3 // Point | LineString | Polygon
  geometry:
    | number[][] // for Point and LineString
    | number[][][] // for Polygon (including MultiPolygon)
  properties: Record<string, unknown>
}
