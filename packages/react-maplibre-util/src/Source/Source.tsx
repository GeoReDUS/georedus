import React, { type ComponentProps } from 'react'
import { Source as MapGlSource } from 'react-map-gl/maplibre'
import { FeatureState, useFeatureState } from '../useFeatureState'
import { getSourceRemountKey } from '../util'

type MapGlSourceProps = ComponentProps<typeof MapGlSource>

export type SourceProps = MapGlSourceProps & {
  id: string // required here (optional on <Source />) since feature-state needs a stable id
  featureState: FeatureState
}

/**
 * Drop-in replacement for react-map-gl's <Source /> that also declaratively
 * syncs MapLibre feature-state from props.
 */
export function Source({ id, featureState, ...sourceProps }: SourceProps) {
  useFeatureState(featureState ? { [id]: featureState } : {})

  return (
    <MapGlSource
      //
      // Use `getSourceRemountKey` to ensure that
      // non-reactive props (props that react-map-gl as no
      // way of updating on maplibre) force re-mount
      // of component
      //
      key={getSourceRemountKey(id, sourceProps)}
      id={id}
      {...sourceProps}
    />
  )
}
