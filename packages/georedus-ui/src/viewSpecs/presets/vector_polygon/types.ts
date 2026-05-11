export type ItemStyleSpec = {
  color?: string
  fillPattern?:
    | 'circles_1'
    | 'cross_1'
    | 'diamonds_1'
    | 'lines_1'
    | 'mosaic_1'
    | 'mosaic_2'
    | 'squares_1'
    | 'triangles_1'
    | 'waves_1'
    | 'solid'
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none'
}

export type VectorPolygonCategoricalSingle = {
  dataType: 'categorical_single'
} & ItemStyleSpec

export type VectorPolygonCategoricalMultiple = {
  dataType: 'categorical_multiple'
  categoryKey: string
  colorScheme:
    | 'schemeGeoReDUSVectorPolygon'
    | 'schemeCategory10'
    | 'schemeAccent'
    | 'schemeDark2'
    | 'schemeObservable10'
    | 'schemePaired'
    | 'schemePastel1'
    | 'schemePastel2'
    | 'schemeSet1'
    | 'schemeSet2'
    | 'schemeSet3'
  categories?: (ItemStyleSpec & {
    value: string
    label?: string
  })[]
} & ItemStyleSpec

export type VectorPolygonSequential = {
  dataType: 'sequential'
  fillPattern?:
    | 'circles_1'
    | 'cross_1'
    | 'diamonds_1'
    | 'lines_1'
    | 'mosaic_1'
    | 'mosaic_2'
    | 'squares_1'
    | 'triangles_1'
    | 'waves_1'
    | 'solid'
}

export type StyleSpec =
  | VectorPolygonCategoricalSingle
  | VectorPolygonCategoricalMultiple
  | VectorPolygonSequential

export type StyleSpecInput =
  | string
  | VectorPolygonCategoricalSingle
  | VectorPolygonCategoricalMultiple
  | VectorPolygonSequential
