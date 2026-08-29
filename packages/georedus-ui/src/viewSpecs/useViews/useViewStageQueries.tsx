import { useQueries, UseQueryOptions } from '@tanstack/react-query'
import {
  ResolvedView,
  ViewResolutionContextBase,
  ViewSpec,
  ViewStageKey,
} from '../types'
import { ViewConf } from '../../GeoReDUS/viewConfReducer'

import type { QueriesByStage, ViewToResolve } from './types'
import {
  viewsFromStageQueries,
  queryKeyHashFnWithFileSupport,
  viewHasResolvedStages,
  useViewStageQueriesCache,
} from './util'

//
// utility to compute the viewStageQueryKey
//
function _viewStageQueryKey({
  viewId,
  stageKey,
  viewResolutionContextBase,
  viewSpec,
  viewConf,
}: {
  viewId: string
  stageKey: ViewStageKey
  viewResolutionContextBase: ViewResolutionContextBase
  viewSpec: ViewSpec
  viewConf: ViewConf
}) {
  //
  // Query key composition:
  //   'ViewStage'  — namespace, avoids collisions with other query keys
  //   viewId       — scopes cache per view; views are independent
  //   stageKey     — scopes within a view; each stage has its own entry
  //   viewConf     — invalidates all stages for this view on conf change
  //   app          — invalidates all stages for all views on app context change
  //   stageDependencies — fine-grained cross-stage invalidation; only the
  //                       upstream data this stage declared interest in
  //
  return [
    'ViewStage',
    viewId,
    stageKey,
    //
    // Loop through viewConf scopes and within each conf scope,
    // loop through all propKeys, filter by those in which either
    // `notify` is not set / is null or it is set to a string / array
    // that includes the target stageKey
    //
    Object.fromEntries(
      Object.entries(viewConf).map(([confScopeKey, conf]) => [
        confScopeKey,
        Object.fromEntries(
          Object.keys(conf)
            .filter((confPropKey) => {
              const propNotify =
                viewSpec.confSchema?.[confScopeKey]?.[confPropKey]?.notify

              return (
                !propNotify ||
                (typeof propNotify === 'string' && propNotify === stageKey) ||
                (Array.isArray(propNotify) && propNotify.includes(stageKey))
              )
            })
            .map((confPropKey) => [confPropKey, conf[confPropKey]]),
        ),
      ]),
    ),
    viewResolutionContextBase.app,
  ]
}

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
  viewsToResolve,
  queriesByStage,
  queryFn,
}: {
  enabled: boolean
  stageKey: ViewStageKey
  dependsOnStages?: ViewStageKey[] | null
  viewResolutionContextBase: ViewResolutionContextBase
  viewsToResolve: ViewToResolve[]
  queriesByStage: QueriesByStage
  // partialViews: Partial<ResolvedView>[]
  queryFn: (
    viewToResolve: ViewToResolve,
    partialView: Partial<ResolvedView>,
  ) => Promise<Partial<ResolvedView>>
}) {
  const partialViews: Partial<ResolvedView>[] = viewsFromStageQueries({
    viewsToResolve,
    queriesByStage,
  })

  const cache = useViewStageQueriesCache(viewsToResolve)

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
      // TODO: move into _viewStageQueryKey
      //
      // `_dependencies` extracts what this stage cares about from prior stage
      // output. Its return value is included in the query key, so the stage
      // re-resolves only when the upstream data it declared interest in
      // changes. If not defined, falls back to 'STABLE_DEPENDENCY' — the
      // stage will not re-resolve due to upstream stage changes.
      //
      const stageDependencies =
        enabled && typeof viewSpec[stageKey]?._dependencies === 'function'
          ? viewSpec[stageKey]._dependencies({
              ...viewResolutionContextBase,
              view: partialView,
            }) || 'STABLE_DEPENDENCY'
          : 'STABLE_DEPENDENCY'

      //
      // Query key composition:
      //   'ViewStage'  — namespace, avoids collisions with other query keys
      //   viewId       — scopes cache per view; views are independent
      //   stageKey     — scopes within a view; each stage has its own entry
      //   viewConf     — invalidates all stages for this view on conf change
      //   app          — invalidates all stages for all views on app context change
      //   stageDependencies — fine-grained cross-stage invalidation; only the
      //                       upstream data this stage declared interest in
      //
      const queryKey = [
        ..._viewStageQueryKey({
          viewId,
          stageKey,
          viewResolutionContextBase,
          viewConf,
          viewSpec,
        }),
        stageDependencies,

        // TODO
        // TODO
        // TODO
        // TODO
        // TODO
        // TODO:
        // should not inject partial view into queryKey,
        // it would be too costly to compute the key, as
        // the partialView, specially after data fetching
        // might have full geoJson objects with complex
        // geometries and etc.
        partialView,
        // TODO
        // TODO
        // TODO
        // TODO
        // TODO
        // TODO
      ]

      return {
        gcTime: 0,
        enabled,
        queryKey,
        queryKeyHashFn: queryKeyHashFnWithFileSupport,

        placeholderData: () => {
          // console.log(
          //   'will return placeholderData',
          //   stageKey,
          //   cache.current[viewId],
          // )
          return cache.current[viewId]
        },

        queryFn: async () => {
          const result = await queryFn(viewToResolve, partialView)

          if (viewSpec.debug) {
            console.log(stageKey, viewSpec.id, result, partialView)
          }
          // update cache
          cache.current[viewId] = result

          return result
        },
        throwOnError: process.env.NODE_ENV !== 'production',
      } as UseQueryOptions
    }),
  })
}
