import { useRef } from 'react'
import { ViewToResolve } from '../types'

export function useViewStageQueriesCache(viewsToResolve: ViewToResolve[]) {
  const cache = useRef<Record<string, unknown>>({})
  const prevIdsRef = useRef<Set<string> | null>(null)

  const currentViewIds = new Set(viewsToResolve.map((v) => v.viewId))
  const changed =
    !prevIdsRef.current ||
    prevIdsRef.current.size !== currentViewIds.size ||
    [...currentViewIds].some((id) => !prevIdsRef.current!.has(id))

  if (changed) {
    for (const viewId of Object.keys(cache.current)) {
      if (!currentViewIds.has(viewId)) {
        delete cache.current[viewId]
      }
    }
    prevIdsRef.current = currentViewIds
  }

  return cache
}
