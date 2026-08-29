import { ResolvedView, ViewResolutionContextBase, ViewSpec } from '../types'
import {
  resolveConfSchema,
  resolveControls,
  resolveDownload,
  resolveLayers,
  resolveMetadata,
  resolveSources,
} from '../resolveView'
import { useMemo } from 'react'

import type { QueriesByStage, ViewToResolve } from './types'
import { viewsFromStageQueries, viewHasResolvedStages } from './util'
import { useViewStageQueries } from './useViewStageQueries'

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
    queriesByStage: QUERIES_AT_METADATA,
    // partialViews: viewsFromStageQueries({
    //   viewsToResolve,
    //   queriesByStage: null,
    // }),
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
    queriesByStage: QUERIES_AT_SOURCES,
    // partialViews: viewsFromStageQueries({
    //   viewsToResolve,
    //   queriesByStage: QUERIES_AT_SOURCES,
    // }),
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
    queriesByStage: QUERIES_AT_LAYERS,
    // partialViews: viewsFromStageQueries({
    //   viewsToResolve,
    //   queriesByStage: QUERIES_AT_LAYERS,
    // }),
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
    queriesByStage: QUERIES_AT_CONTROLS,
    // partialViews: viewsFromStageQueries({
    //   viewsToResolve,
    //   queriesByStage: QUERIES_AT_CONTROLS,
    // }),
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
    queriesByStage: QUERIES_AT_CONTROLS,
    // partialViews: viewsFromStageQueries({
    //   viewsToResolve,
    //   queriesByStage: QUERIES_AT_CONTROLS,
    // }),
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
    return viewsFromStageQueries({
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
      return viewHasResolvedStages(partialView, [
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
