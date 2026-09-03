import { validate } from '@orioro/validate'
import { ViewConf } from '../../../GeoReDUS/viewConfReducer'
import {
  ResolvedView,
  ViewResolutionContextBase,
  ViewSpec,
  ViewStageKey,
} from '../../types'
import { QueriesByStage } from '../types'

const GEO_REDUS_VIEW_STAGE_QUERY_KEY_SCOPE = 'GeoReDUS:ViewStage'
const QUERY_KEY_STABLE_DEPENDENCY = 'STABLE_DEPENDENCY'

type ViewStageQueryKeyProps = {
  enabled: boolean
  stageKey: ViewStageKey
  dependsOnStages?: ViewStageKey[] | null

  viewResolutionContextBase: ViewResolutionContextBase
  queriesByStage: Partial<QueriesByStage>

  viewId: string
  viewIndex: number
  viewSpec: ViewSpec
  viewConf: ViewConf
  partialView: Partial<ResolvedView>
}

/**
 * Builds the conf slice that this stage cares about.
 *
 * A conf prop is included when:
 *   - `confSchema[scope][prop].notify` is absent/falsy → invalidates all stages
 *   - `notify` is a string equal to `stageKey`           → invalidates that stage only
 *   - `notify` is an array containing `stageKey`         → invalidates those stages only
 *
 * Props whose `notify` targets a different stage are excluded, so a conf
 * change scoped to `metadata` will not directly invalidate `sources`, `layers`, etc.
 *
 * Note: in practice, downstream stages are still invalidated indirectly. When
 * `metadata` re-resolves due to a conf change, its `dataUpdatedAt` advances,
 * which changes the `_keyUpstreamStageQueryVersions` segment of every stage
 * that `dependsOnStages: ['metadata', ...]`. The `notify` filter therefore
 * controls which stage triggers first, not whether the cascade happens.
 */
function _keyViewConf({
  stageKey,
  viewConf,
  viewSpec,
}: ViewStageQueryKeyProps) {
  return Object.fromEntries(
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
  )
}

/**
 * Returns a version token for each upstream stage this stage depends on.
 *
 * Each token is `[stageKey, 'success:<dataUpdatedAt>']` on success or
 * `[stageKey, 'error:<errorUpdatedAt>']` on error. React Query's timestamps
 * advance on every refetch / new error, so this segment changes exactly when
 * an upstream stage produces new data or transitions to an error state —
 * nothing else.
 *
 * Returns `null` when `dependsOnStages` is absent (stage has no upstream
 * dependencies and is never invalidated by upstream changes).
 */
function _keyUpstreamStageQueryVersions({
  dependsOnStages,
  queriesByStage,
  viewIndex,
}: ViewStageQueryKeyProps) {
  if (!dependsOnStages) {
    return QUERY_KEY_STABLE_DEPENDENCY
  }

  return dependsOnStages.map((stageKey) => {
    const query = queriesByStage[stageKey]?.[viewIndex]

    if (!query) {
      return null
    }

    return query.status === 'error'
      ? [stageKey, `error:${query.errorUpdatedAt}`]
      : query.status === 'pending'
        ? [stageKey, 'pending']
        : query.isPlaceholderData
          ? [stageKey, `placeholder:${query.dataUpdatedAt}`]
          : [stageKey, `success:${query.dataUpdatedAt}`]
  })
}

/**
 * Returns the custom dependency value declared by this stage via
 * `viewSpec[stageKey]._dependencies`.
 *
 * `_dependencies` receives:
 *   - `view`          — the partial view assembled from prior stages of *this* view
 *   - `viewSpecs`     — specs for all active views
 *   - `viewConfState` — conf state for all views; sibling conf is at `viewConfState.byId[siblingViewId]`
 *   - `app`           — global app context (auth, locale, etc.)
 *
 * It should return a serialisable value representing only the data this stage
 * cares about. React Query includes that value in the query key and re-fetches
 * only when it changes — not on every upstream refetch.
 *
 * Primary motivation: cross-view reactivity. A stage can read a sibling
 * view's conf from `viewConfState.byId` and return the slice it depends on.
 * When that sibling conf changes the key changes, triggering re-resolution of
 * this stage without coupling the two views at the pipeline level. Example:
 *
 * ```ts
 * sources: {
 *   _dependencies: ({ viewConfState }) =>
 *     viewConfState.byId['other-view-id']?.filters.someFilter,
 * }
 * ```
 *
 * Falls back to the string `'STABLE_DEPENDENCY'` when:
 *   - `_dependencies` is not defined on the stage spec, or
 *   - `_dependencies` returns a falsy value, or
 *   - the stage is currently disabled (`enabled` is false).
 *
 * `'STABLE_DEPENDENCY'` is a constant that never changes, making the stage
 * immune to upstream data changes (upstream version timestamps in segment 5
 * still apply).
 */
function _keyCustomStageDependencies({
  enabled,
  viewSpec,
  stageKey,
  viewResolutionContextBase,
  partialView,
}: ViewStageQueryKeyProps) {
  return enabled && typeof viewSpec[stageKey]?._dependencies === 'function'
    ? viewSpec[stageKey]._dependencies({
        ...viewResolutionContextBase,
        view: partialView,
      }) || QUERY_KEY_STABLE_DEPENDENCY
    : QUERY_KEY_STABLE_DEPENDENCY
}

/**
 * Computes the React Query cache key for a single view × stage combination.
 *
 * The key is a seven-element array. Elements 0–2 are scoping identifiers that
 * isolate each cache entry. Elements 3–6 are invalidation signals — React
 * Query re-fetches the query whenever any of them changes.
 *
 * ```
 * [0] 'GeoReDUS:ViewStage'          — namespace; prevents collisions with other query keys
 * [1] viewId                         — one cache entry per view
 * [2] stageKey                       — one cache entry per stage within a view
 * [3] app                            — invalidates all stages for all views on app context change
 * [4] viewConf (filtered)            — invalidates stages that declare interest in a conf prop;
 *                                      see _keyViewConf for notify-based filtering
 * [5] upstream stage versions        — invalidates this stage when an upstream stage refetches or errors;
 *                                      null when dependsOnStages is absent
 * [6] custom stage dependencies      — invalidates this stage based on the upstream data slice it
 *                                      declared via viewSpec[stageKey]._dependencies;
 *                                      'STABLE_DEPENDENCY' when not defined
 * ```
 *
 * Invalidation scope summary:
 *   - `app` change           → all stages, all views
 *   - conf prop change       → directly invalidates stages whose `notify` matches;
 *                              downstream stages cascade via element 5 once upstream re-resolves
 *   - upstream stage refetch → all stages listing it in `dependsOnStages`
 *   - upstream data unchanged (guarded by `_dependencies`) → no re-resolution
 */
export function viewStageQueryKey(props: ViewStageQueryKeyProps) {
  const { viewResolutionContextBase } = props

  const viewId = validate.assertValid('string!', props.viewId)
  const stageKey = validate.assertValid('string!', props.stageKey)

  return [
    // [0] namespace
    GEO_REDUS_VIEW_STAGE_QUERY_KEY_SCOPE,
    // [1] view scope
    viewId,
    // [2] stage scope
    stageKey,
    // [3] app context — invalidates all stages, all views
    viewResolutionContextBase.app,
    // [4] conf props relevant to this stage (filtered by notify)
    _keyViewConf(props),
    // [5] upstream stage refetch/error timestamps
    _keyUpstreamStageQueryVersions(props),
    // [6] custom upstream data slice declared by this stage
    _keyCustomStageDependencies(props),
  ]
}
