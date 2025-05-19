import { Map } from 'react-map-gl/maplibre'

import type {
  AnyLayer,
  AnySource,
} from 'react-map-gl/dist/esm/exports-maplibre'
import { MapGeoJSONFeature, MapMouseEvent } from 'maplibre-gl'

// export type MapViewProps = {
//   sources: Source[]
//   layers: AnyLayer[]
// }

// const a: AnyLayer = {
//   interactive: false,
// }

export type MapViewSource = AnySource & {
  //
  // Absolute id is used for source deduplication
  //
  absoluteId?: string
}

export type MapViewLayer = Omit<AnyLayer, 'id'> & {
  //
  // Absolute id is used for layer deduplication
  //
  absoluteId?: string
  interactive?: boolean
  source?: string
  absoluteSourceId?: string

  //
  // zIndex is used to override ordering
  //
  zIndex?: number

  //
  // An optional layer click handler
  //
  onClick?: (feature: MapGeoJSONFeature, event: MapMouseEvent) => any
}

type MapViewLegend = {
  type: string
  [key: string]: any
}

export type MapView = {
  id: string
  sources: Record<string, MapViewSource>
  layers: Record<string, MapViewLayer>
  legends?: MapViewLegend[]

  [key: string]: any
}

export type LayeredMapProps = Parameters<typeof Map>[0] & {
  views: MapView[]
}
