import { ViewResolutionContextBase, ViewSpec, ViewStageKey } from '../types'
import { resolveConfSchema } from '../resolveView'
import { useCallback, useMemo } from 'react'

import type { QueriesByStage, ViewToResolve } from './types'
import { viewsFromStageQueries, viewHasResolvedStages } from './util'
import { PIPELINE_STAGES } from './constants'
import { useViewStageQueries } from './useViewStageQueries'

/**
 * Flat ordered list of all stage keys, derived from `PIPELINE_STAGES`.
 * Parallel stages within the same group appear consecutively.
 */
export const PIPELINE_STAGE_ORDER = PIPELINE_STAGES.flatMap((stageGroup) =>
  stageGroup.map((stage) => stage.stageKey),
)

/**
 * Orchestrates the full view resolution pipeline for all active views.
 *
 * Stages are resolved in groups: `[metadata] → [sources] → [layers] →
 * [controls, download]`. Stages within a group are parallel — they share the
 * same upstream dependencies. Each stage receives a snapshot of all preceding
 * resolved queries so downstream stages can read prior results.
 *
 * Each view × stage pair is an independent React Query query. A single view
 * can update without triggering re-resolution of any other view.
 *
 * `resolvedViews` carries all active views with raw stage data (sentinels for
 * unresolved stages). Use `viewsReadyAtStage` to obtain a filtered subset.
 *
 * `resolvedViewSpecs` are resolved synchronously because schema changes must
 * reflect immediately as the user edits conf values.
 */
export function useViews(viewResolutionContextBase: ViewResolutionContextBase) {
  const { viewSpecs, viewConfState } = viewResolutionContextBase

  const VIEWS_ENABLED = Boolean(viewSpecs && viewConfState)

  const viewSpecsById = useMemo(
    () =>
      Array.isArray(viewSpecs)
        ? viewSpecs.reduce(
            (acc, viewSpec) => ({
              ...acc,
              [viewSpec.id]: viewSpec,
            }),
            {} as Record<string, ViewSpec>,
          )
        : null,
    [viewSpecs],
  )

  //
  // Filter out views that are not listed in specs
  // All useQueries calls will from this point onward
  // have the same array of base queries and same order
  // as well.
  //
  const viewsToResolve: ViewToResolve[] = useMemo(() => {
    if (!viewSpecsById || !viewConfState) {
      return []
    }

    return viewConfState.layout
      .flatMap((list) => list.items.map((item) => item.id))
      .map((viewId) => {
        const viewSpec = viewSpecsById[viewId] || null
        const viewConf = viewConfState.byId[viewId] || null

        return viewSpec && viewConf
          ? {
              viewId,
              viewConf,
              viewSpec,
            }
          : null
      })
      .filter(Boolean) as ViewToResolve[]
  }, [viewSpecsById, viewConfState])

  let QUERIES_BY_STAGE_ACC: Partial<QueriesByStage> = {}

  for (const [stageGroupIndex, stageGroup] of PIPELINE_STAGES.entries()) {
    //
    // stageGroup is a list of parallel stages
    //
    stageGroup.forEach(({ stageKey, dependsOnStages, resolveFn }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const queries = useViewStageQueries({
        enabled: VIEWS_ENABLED,
        stageKey,
        dependsOnStages:
          dependsOnStages === 'all_previous_stages'
            ? PIPELINE_STAGES.slice(0, stageGroupIndex).flatMap((stageGroup) =>
                stageGroup.map((stage) => stage.stageKey),
              )
            : dependsOnStages,
        viewResolutionContextBase,
        viewsToResolve,
        queriesByStage: QUERIES_BY_STAGE_ACC,
        queryFn: async ({ viewSpec }, partialView) =>
          (await resolveFn(viewSpec, partialView, viewResolutionContextBase)) ||
          null,
      })
      QUERIES_BY_STAGE_ACC = { ...QUERIES_BY_STAGE_ACC, [stageKey]: queries }
    })
  }

  //
  // Memoize the final accumulator so downstream memos and consumers
  // receive a stable reference. Deps are the individual stage query arrays
  // spread dynamically — safe because PIPELINE_STAGES length is constant.
  //
  const QUERIES_BY_STAGE_ALL = useMemo(
    () => QUERIES_BY_STAGE_ACC as QueriesByStage,
    Object.values(QUERIES_BY_STAGE_ACC),
  )

  const resolvedViews = useMemo(
    () =>
      viewsFromStageQueries({
        viewsToResolve,
        queriesByStage: QUERIES_BY_STAGE_ALL,
      }),
    [viewsToResolve, QUERIES_BY_STAGE_ALL],
  )

  const viewsReadyAtStage = useCallback(
    (stageKey: ViewStageKey) => {
      return resolvedViews.filter((partialView) =>
        viewHasResolvedStages(
          partialView,
          PIPELINE_STAGE_ORDER.slice(
            0,
            PIPELINE_STAGE_ORDER.indexOf(stageKey) + 1,
          ),
        ),
      )
    },
    [resolvedViews],
  )

  //
  // Per-view bottleneck stage: the first stage in pipeline order that is still
  // loading for that view. null when all stages for that view are resolved.
  //
  const currentLoadingStageByViewId = useMemo(() => {
    return Object.fromEntries(
      viewsToResolve.map(({ viewId }, viewIndex) => [
        viewId,
        PIPELINE_STAGE_ORDER.find((stageKey) => {
          const query = QUERIES_BY_STAGE_ALL[stageKey][viewIndex]
          return (
            query.status === 'pending' ||
            (query.status === 'success' && query.isPlaceholderData)
          )
        }) ?? null,
      ]),
    )
  }, [viewsToResolve, QUERIES_BY_STAGE_ALL])

  const currentLoadingStage = useCallback(
    (viewId: string | null = null) => {
      if (viewId === null) {
        //
        // Global bottleneck stage: the earliest pipeline stage that is still loading
        // across any view. null when all views are fully resolved.
        //
        const perViewStages = Object.values(currentLoadingStageByViewId).filter(
          Boolean,
        ) as (typeof PIPELINE_STAGE_ORDER)[number][]
        return (
          PIPELINE_STAGE_ORDER.find((stageKey) =>
            perViewStages.includes(stageKey),
          ) ?? null
        )
      } else {
        //
        // Return per view
        //
        return currentLoadingStageByViewId[viewId] || null
      }
    },
    [currentLoadingStageByViewId],
  )

  //
  // Resolve view specs so that they may take input
  // from other view confs
  //
  // This is best done synchronously, as the schema modification
  // happens as the user changes conf values. Async resolution
  // results in buggy interface.
  //
  // TODO:
  // Possibly move this away from here, should go to useViewSpecs hook
  //
  const resolvedViewSpecs = useMemo(() => {
    if (!viewSpecs || !viewsToResolve || viewsToResolve.length === 0) {
      return viewSpecs
    }

    const _byId = Object.fromEntries(
      viewsToResolve.map((toResolve) => {
        const { viewId } = toResolve

        return [viewId, toResolve]
      }),
    )

    return viewSpecs.map((viewSpec) => {
      const viewToResolve = _byId[viewSpec.id]

      return !viewToResolve
        ? viewSpec
        : {
            ...viewSpec,
            confSchema: resolveConfSchema(
              viewSpec,
              viewToResolve.viewConf,
              viewResolutionContextBase,
            ),
          }
    })
  }, [viewSpecs, viewsToResolve, viewResolutionContextBase])

  return {
    currentLoadingStage,
    queriesByStage: QUERIES_BY_STAGE_ALL,
    viewsReadyAtStage,
    resolvedViews,
    resolvedViewSpecs,
  }
}
