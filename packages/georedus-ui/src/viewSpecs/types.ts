import {
  MapView,
  MapViewLayer,
  MapViewSource,
} from '@orioro/react-maplibre-util'
import React from 'react'
import { ViewConf, ViewConfState } from '../GeoReDUS/viewConfReducer'
import { UseQueryOptions } from '@tanstack/react-query'

export type ExpressionOf<ResultT> = ResultT | [string, ...any[]]

export type ViewMetadata = {
  [key: string]: any
}

//
// Resolution context available to all views
//
export type ViewResolutionContextBase = {
  viewSpecs: ViewSpec[]
  viewConfState: ViewConfState
  app: AppContext
  enabled?: boolean
}

type StageSpec<
  Spec extends { [key: string]: any },
  PartialViewAtState extends Partial<ResolvedView | null>,
> = Spec & {
  _loading?: MapView & {
    message?: React.ReactNode
  }
  _dependencies?: (
    resolutionCtx: ViewResolutionContextBase & {
      view: PartialViewAtState
    },
  ) => any
  _value?: Spec
  _query?: Pick<UseQueryOptions, 'gcTime'>
}

export type ViewMetadataSpec = StageSpec<
  ViewMetadata,
  Pick<ResolvedView, 'conf'>
>

export type ViewSources = {
  [key: string]: MapViewSource
}

export type ViewSourcesSpec = StageSpec<
  ViewSources,
  Pick<ResolvedView, 'conf' | 'metadata'>
>

export type ViewLayers = {
  [key: string]: MapViewLayer
}

export type ViewLayersSpec = StageSpec<
  ViewLayers,
  Pick<ResolvedView, 'conf' | 'metadata' | 'sources'>
>

export type ViewControls = {
  legends?: MapView['legends']
}

export type ViewControlsSpec = StageSpec<
  ViewControls,
  Pick<ResolvedView, 'conf' | 'metadata' | 'sources' | 'layers'>
>

export type ViewDownload = (conf: {
  dialogs: Record<string, any>
}) => Promise<any>
export type ViewDownloadSpec = StageSpec<
  ViewDownload,
  Pick<ResolvedView, 'conf' | 'metadata' | 'sources' | 'layers'>
>

export type ViewStageKey =
  | 'metadata'
  | 'sources'
  | 'layers'
  | 'controls'
  | 'download'

export type ViewSpec = {
  id: string
  debug?: boolean
  keywords?: string | string[]
  metadata: ViewMetadataSpec
  sources: ViewSourcesSpec
  layers: ViewLayersSpec
  controls: ViewControlsSpec
  download?: ViewDownloadSpec
}

export type ResolvedViewConf = ViewConf & {
  data?: Record<string, any>
  style?: Record<string, any>
}

type ResolvedLayer = MapViewLayer & {
  tooltip?: (props: { feature: GeoJSON.Feature }) => React.ReactNode
}

export type ResolvedView = MapView & {
  conf: ResolvedViewConf
  metadata: ViewMetadata
  controls: ViewControls
  download: ViewDownload
}

//
// AppContext can be anything. currently:
// - municipioId: string
//
export type AppContext = Record<string, any>

export type PresetFn<InputT extends Record<string, any> = Record<string, any>> =
  (input: InputT) => ViewSpec

export type ResolveViewSpecsContext = {
  METADATA_API_ENDPOINT: string
  VECTOR_TILE_SERVER_ENDPOINT: string
}
