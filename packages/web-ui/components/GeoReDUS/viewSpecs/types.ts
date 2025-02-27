import {
  MapView,
  MapViewLayer,
  MapViewSource,
} from '@orioro/react-maplibre-util'
import type { GeoJSON } from 'geojson'
import React from 'react'

export type ExpressionOf<ResultT> = ResultT | [string, ...any[]]

export type ViewMetadata = Record<string, any>

export type ViewConfSpec = {
  data?: Record<string, Record<string, any>>
  style?: Record<string, Record<string, any>>
}

export type ViewSpec = {
  id: string
  metadata: ExpressionOf<ViewMetadata>
  sources: ExpressionOf<Record<string, MapViewSource>>
  layers: ExpressionOf<Record<string, MapViewLayer>>
  conf: ViewConfSpec
}

export type ResolvedViewConf = {
  data?: Record<string, any>
  style?: Record<string, any>
}

type ResolvedLegend = Record<string, any>

type ResolvedLayer = MapViewLayer & {
  tooltip?: (props: { feature: GeoJSON.Feature }) => React.ReactNode
}

export type ResolvedView = MapView & {
  metadata: ViewMetadata
  legends: ResolvedLegend[]
  conf: ResolvedViewConf
}

export type ViewContext = {
  focus: {
    //
    // Possibly support;
    // type: 'bairro' | 'municipio' | 'microrregiao' | 'mesoregiao' | 'regiao_de_saude' | 'uf'
    //
    type: 'municipio'
    ids: string[]
  } | null
}

export type PresetFn<InputT extends Record<string, any> = Record<string, any>> =
  (input: InputT) => ViewSpec

export type ResolveViewSpecsContext = {
  METADATA_API_ENDPOINT: string
  VECTOR_TILE_SERVER_ENDPOINT: string
}
