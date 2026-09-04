import { useQueries, UseQueryOptions } from '@tanstack/react-query'
import { ResolvedView, ViewResolutionContextBase, ViewStageKey } from '../types'

import type { QueriesByStage, ViewToResolve } from './types'
import {
  viewsFromStageQueries,
  queryKeyHashFnWithFileSupport,
  viewHasResolvedStages,
  useViewStageQueriesCache,
  viewStageQueryKey,
} from './util'

/**
 * Fans out one React Query query per view for a single pipeline stage via
 * `useQueries`.
 *
 * Each query is enabled only when:
 * 1. The global `enabled` flag is true.
 * 2. All `dependsOnStages` are resolved on that view's partial view.
 *
 * The query key includes the result of `viewSpec[stageKey]._dependencies` (if
 * defined), allowing stages to declare fine-grained cache invalidation based
 * on prior stage data or app context.
 */
export function useViewStageQueries({
  enabled: extEnabled,
  stageKey,
  dependsOnStages = null,
  viewResolutionContextBase,
  queriesByStage,
  viewsToResolve,
  queryFn,
}: {
  enabled: boolean
  stageKey: ViewStageKey
  dependsOnStages?: ViewStageKey[] | null
  viewResolutionContextBase: ViewResolutionContextBase
  queriesByStage: Partial<QueriesByStage>
  viewsToResolve: ViewToResolve[]
  queryFn: (
    viewToResolve: ViewToResolve,
    partialView: Partial<ResolvedView>,
  ) => Promise<Partial<ResolvedView>>
}) {
  //
  // Recompose the partial views
  //
  const partialViews: Partial<ResolvedView>[] = viewsFromStageQueries({
    viewsToResolve,
    queriesByStage,
  })

  //
  // Create a stageCache for all views on the stage
  //
  const stageCache = useViewStageQueriesCache(viewsToResolve)

  return useQueries({
    queries: viewsToResolve.map((viewToResolve, viewIndex) => {
      const { viewId, viewSpec, viewConf } = viewToResolve

      const partialView = partialViews[viewIndex]

      const enabled =
        extEnabled &&
        (Array.isArray(dependsOnStages)
          ? viewHasResolvedStages(partialView, dependsOnStages)
          : true)

      //
      // queryKey controls when a certain query is refetched
      // it is the heart of the refetching system,
      // to check rationale behind every query key component,
      // see @util/viewStageQueryKey
      //
      const queryKey = viewStageQueryKey({
        enabled,
        stageKey,
        viewResolutionContextBase,
        dependsOnStages,
        queriesByStage,

        viewId,
        viewIndex,
        viewConf,
        viewSpec,
        partialView,
      })

      return {
        enabled,
        queryKey,
        queryKeyHashFn: queryKeyHashFnWithFileSupport,
        placeholderData: () => stageCache.current[viewId],
        queryFn: async () => {
          const result = await queryFn(viewToResolve, partialView)

          if (viewSpec.debug) {
            console.log(stageKey, viewSpec.id, result, partialView)
          }

          // update stageCache
          stageCache.current[viewId] = result

          return result
        },
        throwOnError: process.env.NODE_ENV !== 'production',
      } as UseQueryOptions
    }),
  })
}
