import type { FilterSpecification } from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-map-gl/maplibre'

type SourceId = string
type FeatureId = string | number
type FeatureStateValue = Record<string, unknown>

export type QuerySpec = {
  filter: FilterSpecification
  state: FeatureStateValue
}

export type FeatureState = {
  sourceLayer?: string
  //
  // TODO: handle featureIdType casting
  //
  featureIdType?: 'string' | 'number'
  stateById?: Record<FeatureId, FeatureStateValue>
  stateByQuery?: QuerySpec[]
}

export type FeatureStateBySourceId = Record<SourceId, FeatureState>

function _resolveState(
  map: maplibregl.Map,
  sourceId: SourceId,
  { sourceLayer, stateById, stateByQuery }: FeatureState,
): Record<FeatureId, FeatureStateValue> {
  const result: Record<FeatureId, FeatureStateValue> = {}

  for (const spec of stateByQuery ?? []) {
    const features = map.querySourceFeatures(sourceId, {
      sourceLayer,
      filter: spec.filter,
    })
    for (const f of features) {
      if (f.id === undefined) continue
      // result[f.id] may be undefined here — spreading undefined is a no-op
      // ({ ...undefined, ...x } === { ...x }), so this is safe as-is.
      result[f.id] = { ...result[f.id], ...spec.state }
    }
  }

  for (const id in stateById) {
    result[id] = { ...result[id], ...stateById[id] }
  }

  return result
}

export function useFeatureState(
  featureStateBySourceId: Record<SourceId, FeatureState> = {},
) {
  const mapRef = useMap()
  const map = mapRef.current?.getMap()

  const prevAppliedStateBySourceId = useRef<
    Record<SourceId, Record<FeatureId, FeatureStateValue>>
  >({})

  useEffect(() => {
    if (!map) {
      return
    }

    let appliedOnceBySourceId: Record<SourceId, boolean> = {}

    function _applySourceFeatureState(sourceId: SourceId) {
      const featureState = featureStateBySourceId[sourceId]
      const _map: maplibregl.Map = map as maplibregl.Map

      if (!_map.getSource(sourceId)) {
        return false
      }

      const _nextSourceAppliedState = _resolveState(
        _map,
        sourceId,
        featureState,
      )
      const _prevSourceAppliedState =
        prevAppliedStateBySourceId.current[sourceId] || {}

      //
      // TODO: maybe add batching + requestAnimationFrame
      //
      for (const id in _nextSourceAppliedState) {
        _map.setFeatureState(
          {
            source: sourceId,
            sourceLayer: featureState.sourceLayer,
            id,
          },
          _nextSourceAppliedState[id],
        )
      }

      for (const id in _prevSourceAppliedState) {
        if (!(id in _nextSourceAppliedState)) {
          _map.removeFeatureState({
            source: sourceId,
            sourceLayer: featureState.sourceLayer,
            id,
          })
        }
      }

      prevAppliedStateBySourceId.current = {
        ...prevAppliedStateBySourceId.current,
        [sourceId]: _nextSourceAppliedState,
      }

      return true
    }

    appliedOnceBySourceId = Object.fromEntries(
      Object.keys(featureStateBySourceId).map((sourceId) => [
        sourceId,
        _applySourceFeatureState(sourceId),
      ]),
    )

    // Re-apply on sourcedata for two distinct reasons:
    //  1. Initial retry: if the source wasn't registered yet on mount (async
    //     relative to this effect), keep trying until it succeeds — this
    //     matters even for stateById-only usage, not just stateByQuery.
    //  2. Ongoing re-resolution: stateByQuery results only reflect currently
    //     loaded tiles, so once applied at least once, keep re-resolving as
    //     more tiles load — this part only matters when queries are in use.
    function onSourceData(e: maplibregl.MapSourceDataEvent) {
      if (!(e.sourceId in featureStateBySourceId)) {
        //
        // No feature state specified for the given source
        //
        return
      }

      if (!appliedOnceBySourceId[e.sourceId]) {
        appliedOnceBySourceId = {
          ...appliedOnceBySourceId,
          [e.sourceId]: _applySourceFeatureState(e.sourceId),
        }
      } else if (featureStateBySourceId[e.sourceId].stateByQuery?.length) {
        _applySourceFeatureState(e.sourceId)
      }
    }

    map.on('sourcedata', onSourceData)
    return () => {
      map.off('sourcedata', onSourceData)
    }
  }, [map, featureStateBySourceId])
}
