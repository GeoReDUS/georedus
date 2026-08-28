import {
  useQueries,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query'
import {
  ResolvedView,
  ViewResolutionContextBase,
  ViewSpec,
  ViewStageKey,
} from '../types'
import { ViewConf } from '../../GeoReDUS/viewConfReducer'
import { queryKeyHashFnWithFileSupport } from './queryKeyHashFnWithFileSupport'
import {
  resolveConfSchema,
  resolveControls,
  resolveDownload,
  resolveLayers,
  resolveMetadata,
  resolveSources,
} from '../resolveView'
import { useMemo } from 'react'
import { pick } from 'lodash'

const STAGE_LOADING = Symbol.for('STAGE_LOADING')
const STAGE_ERROR = Symbol.for('STAGE_ERROR')

type ViewToResolve = {
  viewId: string
  viewConf: ViewConf
  viewSpec: ViewSpec
}

//
// Object containing queries
//
type QueriesByStage = {
  metadata: UseQueryResult[]
  sources: UseQueryResult[]
  layers: UseQueryResult[]
  controls: UseQueryResult[]
  download: UseQueryResult[]
}

/**
 * Merges query results into partial views. For each stage in `queriesByStage`,
 * assigns query data on success or a sentinel symbol (`STAGE_LOADING` /
 * `STAGE_ERROR`) otherwise. When `queriesByStage` is `null`, returns base
 * views with only `id` and `conf`.
 */
function _viewsFromStageQueries<
  QueriesByStagePartial extends Partial<QueriesByStage> = QueriesByStage,
>({
  viewsToResolve,
  queriesByStage = null,
}: {
  viewsToResolve: ViewToResolve[]
  queriesByStage: QueriesByStagePartial | null
}): Partial<ResolvedView>[] {
  return viewsToResolve.map(
    ({ viewId, viewConf, viewSpec }, viewQueryIndex) => {
      const viewBase = {
        id: viewId,
        conf: viewConf,
      }

      return queriesByStage
        ? Object.assign(
            viewBase,
            Object.fromEntries(
              Object.entries(queriesByStage).map(([stageKey, stageQueries]) => {
                //
                // All queries by stage must share the same viewsToResolve
                //
                const viewQuery = stageQueries[viewQueryIndex]

                return viewQuery.status === 'success'
                  ? [stageKey, viewQuery.data]
                  : [
                      stageKey,
                      //
                      // TODO improve error handling
                      //
                      viewQuery.status === 'pending'
                        ? STAGE_LOADING
                        : STAGE_ERROR,
                    ]
              }),
            ),
          )
        : viewBase
    },
  )
}

/**
 * Utility that checks whether a partial view
 * has all stages from a list resolved
 */
function _hasViewResolvedStages(
  partialView: Partial<ResolvedView>,
  stages: ViewStageKey[],
): boolean {
  return stages.every((stageKey) => {
    const stageValue = partialView[stageKey] as unknown

    return (
      typeof stageValue !== 'undefined' &&
      stageValue !== STAGE_LOADING &&
      stageValue !== STAGE_ERROR
    )
  })
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
function useViewStageQueries({
  enabled: extEnabled,
  stageKey,
  dependsOnStages = null,
  viewResolutionContextBase,
  viewsToResolve,
  partialViews,
  queryFn,
}: {
  enabled: boolean
  stageKey: ViewStageKey
  dependsOnStages?: ViewStageKey[] | null
  viewResolutionContextBase: ViewResolutionContextBase
  viewsToResolve: ViewToResolve[]
  partialViews: Partial<ResolvedView>[]
  queryFn: (
    viewToResolve: ViewToResolve,
    partialView: Partial<ResolvedView>,
  ) => Promise<Partial<ResolvedView>>
}) {
  return useQueries({
    queries: viewsToResolve.map((viewToResolve, viewIndex) => {
      const { viewId, viewSpec, viewConf } = viewToResolve

      const partialView = partialViews[viewIndex]

      const enabled =
        extEnabled &&
        (Array.isArray(dependsOnStages)
          ? _hasViewResolvedStages(partialView, dependsOnStages)
          : true)

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
        'ViewStage',
        viewId,
        stageKey,
        viewConf,
        viewResolutionContextBase.app,
        stageDependencies,
      ]

      return {
        gcTime: 0,
        enabled,
        queryKey,
        queryKeyHashFn: queryKeyHashFnWithFileSupport,
        queryFn: async () => {
          const result = await queryFn(viewToResolve, partialView)

          if (viewSpec.debug) {
            console.log(stageKey, viewSpec.id, result, partialView)
          }

          return result
        },
        throwOnError: process.env.NODE_ENV !== 'production',
      } as UseQueryOptions
    }),
  })
}

/**
 * Orchestrates the full view resolution pipeline for all active views.
 *
 * Stages are resolved in sequence: `metadata → sources → layers →
 * (controls, download)`. Each stage receives a snapshot of the preceding
 * resolved queries as `partialViews` so downstream stages can read prior
 * results.
 *
 * Each view × stage pair is an independent React Query query. This means a
 * single view can update without triggering re-resolution of any other view.
 *
 * `resolvedViews` contains only views where `metadata`, `sources`, and
 * `layers` are fully resolved — the minimum required for rendering.
 * `download` is intentionally excluded from this gate.
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

  //
  // 1. metadata
  //
  const QUERIES_AT_METADATA = {}
  const metadataQueries = useViewStageQueries({
    enabled: VIEWS_ENABLED,
    stageKey: 'metadata',
    dependsOnStages: null,
    viewResolutionContextBase,
    viewsToResolve,
    partialViews: _viewsFromStageQueries({
      viewsToResolve,
      queriesByStage: null,
    }),
    queryFn: async ({ viewSpec }, partialView) => {
      return (
        (await resolveMetadata(
          viewSpec,
          partialView as Pick<ResolvedView, 'conf'>,
          viewResolutionContextBase,
        )) || null
      )
    },
  })

  //
  // 2. sources
  //
  const QUERIES_AT_SOURCES: Pick<QueriesByStage, 'metadata'> = {
    ...QUERIES_AT_METADATA,
    metadata: metadataQueries,
  }
  const sourcesQueries = useViewStageQueries({
    enabled: VIEWS_ENABLED,
    stageKey: 'sources',
    dependsOnStages: ['metadata'],
    viewResolutionContextBase,
    viewsToResolve,
    partialViews: _viewsFromStageQueries({
      viewsToResolve,
      queriesByStage: QUERIES_AT_SOURCES,
    }),
    queryFn: async ({ viewSpec }, partialView) =>
      (await resolveSources(
        viewSpec,
        partialView as Pick<ResolvedView, 'conf' | 'metadata'>,
        viewResolutionContextBase,
      )) || null,
  })

  //
  // 3. layers
  //
  const QUERIES_AT_LAYERS: Pick<QueriesByStage, 'metadata' | 'sources'> = {
    ...QUERIES_AT_SOURCES,
    sources: sourcesQueries,
  }
  const layersQueries = useViewStageQueries({
    enabled: VIEWS_ENABLED,
    stageKey: 'layers',
    dependsOnStages: ['metadata', 'sources'],
    viewResolutionContextBase,
    viewsToResolve,
    partialViews: _viewsFromStageQueries({
      viewsToResolve,
      queriesByStage: QUERIES_AT_LAYERS,
    }),
    queryFn: async ({ viewSpec }, partialView) =>
      (await resolveLayers(
        viewSpec,
        partialView as Pick<ResolvedView, 'conf' | 'metadata' | 'sources'>,
        viewResolutionContextBase,
      )) || null,
  })

  //
  // 4.1. controls
  //
  const QUERIES_AT_CONTROLS: Pick<
    QueriesByStage,
    'metadata' | 'sources' | 'layers'
  > = {
    ...QUERIES_AT_LAYERS,
    layers: layersQueries,
  }
  const controlsQueries = useViewStageQueries({
    enabled: VIEWS_ENABLED,
    stageKey: 'controls',
    dependsOnStages: ['metadata', 'sources', 'layers'],
    viewResolutionContextBase,
    viewsToResolve,
    partialViews: _viewsFromStageQueries({
      viewsToResolve,
      queriesByStage: QUERIES_AT_CONTROLS,
    }),
    queryFn: async ({ viewSpec }, partialView) =>
      (await resolveControls(
        viewSpec,
        partialView as Pick<
          ResolvedView,
          'conf' | 'metadata' | 'sources' | 'layers'
        >,
        viewResolutionContextBase,
      )) || null,
  })

  //
  // 4.2. download
  //
  const downloadQueries = useViewStageQueries({
    enabled: VIEWS_ENABLED,
    stageKey: 'download',
    dependsOnStages: ['metadata', 'sources', 'layers'],
    viewResolutionContextBase,
    viewsToResolve,
    partialViews: _viewsFromStageQueries({
      viewsToResolve,
      queriesByStage: QUERIES_AT_CONTROLS,
    }),
    queryFn: async ({ viewSpec }, partialView) =>
      (await resolveDownload(
        viewSpec,
        partialView as Pick<
          ResolvedView,
          'conf' | 'metadata' | 'sources' | 'layers'
        >,
        viewResolutionContextBase,
      )) || null,
  })

  const resolvedViews = useMemo(() => {
    return _viewsFromStageQueries({
      viewsToResolve,
      queriesByStage: {
        metadata: metadataQueries,
        sources: sourcesQueries,
        layers: layersQueries,
        controls: controlsQueries,
        download: downloadQueries,
      },
    }).filter((partialView) => {
      //
      // Views that have been resolved up to layers stage
      // are considered to be resolved
      //
      return _hasViewResolvedStages(partialView, [
        'metadata',
        'sources',
        'layers',
        // 'controls',
        // 'download',
      ])
    })
  }, [
    viewsToResolve,
    metadataQueries,
    sourcesQueries,
    layersQueries,
    controlsQueries,
    downloadQueries,
  ])

  //
  // Takes into consideration if any query is still loading
  //
  const isLoading = useMemo(() => {
    return [
      ...metadataQueries,
      ...sourcesQueries,
      ...layersQueries,
      ...controlsQueries,
    ].some((query) => query.status === 'pending')
  }, [metadataQueries, sourcesQueries, layersQueries, controlsQueries])

  //
  // Resolve view specs so that they may take input
  // from other view confs
  //
  // This is best done synchronously, as the schema modification
  // happens as the user changes conf values. Async resolution
  // results in buggy interface.
  //
  // TODO:
  // Probably move this away from here, should go to useViewSpecs hook
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
    isLoading,
    metadataQueries,
    sourcesQueries,
    layersQueries,
    controlsQueries,
    downloadQueries,
    resolvedViews,
    resolvedViewSpecs,
  }
}
