import {
  Query,
  useQueries,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query'
import {
  ResolvedView,
  ViewResolutionContextBase,
  ViewSpec,
  ViewStageKey,
} from '../types'
import { ViewConf, ViewConfState } from '../../GeoReDUS/viewConfReducer'
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
  confSchema: UseQueryResult[]
  metadata: UseQueryResult[]
  sources: UseQueryResult[]
  layers: UseQueryResult[]
  controls: UseQueryResult[]
  download: UseQueryResult[]
}

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
        //
        // TODO rename viewSpec.conf to viewSpec.confSchema
        // at all existing schemas
        //
        confSchema: viewSpec.confSchema,
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

//
// Utility that checks whether a partial view
// has all stages from a list resolved
//
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

      // if (stageKey === 'controls') {
      //   console.log('======')
      //   console.log({
      //     partialView,
      //     dependsOnStages,
      //     _hasViewResolvedStages: _hasViewResolvedStages(
      //       partialView,
      //       dependsOnStages,
      //     ),
      //   })
      //   console.log('======')
      // }

      const stageDependencies =
        enabled && typeof viewSpec[stageKey]?._dependencies === 'function'
          ? viewSpec[stageKey]._dependencies({
              ...viewResolutionContextBase,
              view: partialView,
            }) || 'CONSTANT_DEPENDENCY'
          : 'CONSTANT_DEPENDENCY'

      const queryKey = [
        'ViewStage',
        viewId,
        stageKey,
        viewConf,
        viewResolutionContextBase.app.municipioId,
        stageDependencies,
      ]

      // if (stageKey === 'confSchema') {
      //   console.log('confSchema queryKey', queryKey)
      // }

      return {
        ...(viewSpec[stageKey]?._query
          ? pick(viewSpec[stageKey]?._query, ['gcTime'])
          : {}),
        enabled,
        queryKey,
        queryKeyHashFn: queryKeyHashFnWithFileSupport,
        queryFn: async () => {
          // if (stageKey === 'confSchema') {
          //   console.log('will run confSchema query', partialView)
          // }

          return queryFn(viewToResolve, partialView)
        },
        throwOnError: process.env.NODE_ENV !== 'production',
      } as UseQueryOptions
    }),
  })
}

export function useViews(viewResolutionContextBase: ViewResolutionContextBase) {
  const { viewSpecs, viewConfState } = viewResolutionContextBase

  const VIEWS_ENABLED = Boolean(viewSpecs && viewConfState)

  // if (!viewSpecs || !viewConfState) {
  //   alert('will return!!')

  //   return {
  //     resolvedViews: [],
  //   }
  // }

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

  const QUERIES_AT_CONF = {}
  const confSchemaQueries = useViewStageQueries({
    enabled: VIEWS_ENABLED,
    stageKey: 'confSchema',
    dependsOnStages: null,
    viewResolutionContextBase,
    viewsToResolve,
    partialViews: _viewsFromStageQueries({
      viewsToResolve,
      queriesByStage: null,
    }),
    queryFn: async ({ viewSpec }, partialView) => {
      console.log('will resolve conf')

      const resolvedConf = await resolveConfSchema(
        viewSpec,
        partialView as Pick<ResolvedView, 'conf'>,
        viewResolutionContextBase,
      )

      console.log('resolvedConf', resolvedConf)

      return resolvedConf
    },
  })

  const QUERIES_AT_METADATA: Pick<QueriesByStage, 'confSchema'> = {
    ...QUERIES_AT_CONF,
    confSchema: confSchemaQueries,
  }
  const metadataQueries = useViewStageQueries({
    enabled: VIEWS_ENABLED,
    stageKey: 'metadata',
    dependsOnStages: ['confSchema'],
    viewResolutionContextBase,
    viewsToResolve,
    partialViews: _viewsFromStageQueries({
      viewsToResolve,
      queriesByStage: QUERIES_AT_METADATA,
    }),
    queryFn: async ({ viewSpec }, partialView) => {
      console.log('partialView at metadata', partialView)

      return resolveMetadata(
        viewSpec,
        partialView as Pick<ResolvedView, 'conf'>,
        viewResolutionContextBase,
      )
    },
  })

  const QUERIES_AT_SOURCES: Pick<QueriesByStage, 'confSchema' | 'metadata'> = {
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
      resolveSources(
        viewSpec,
        partialView as Pick<ResolvedView, 'conf' | 'metadata'>,
        viewResolutionContextBase,
      ),
  })

  const QUERIES_AT_LAYERS: Pick<
    QueriesByStage,
    'confSchema' | 'metadata' | 'sources'
  > = {
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
      resolveLayers(
        viewSpec,
        partialView as Pick<ResolvedView, 'conf' | 'metadata' | 'sources'>,
        viewResolutionContextBase,
      ),
  })

  const QUERIES_AT_CONTROLS: Pick<
    QueriesByStage,
    'confSchema' | 'metadata' | 'sources' | 'layers'
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
      resolveControls(
        viewSpec,
        partialView as Pick<
          ResolvedView,
          'conf' | 'metadata' | 'sources' | 'layers'
        >,
        viewResolutionContextBase,
      ),
  })

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
      resolveDownload(
        viewSpec,
        partialView as Pick<
          ResolvedView,
          'conf' | 'metadata' | 'sources' | 'layers'
        >,
        viewResolutionContextBase,
      ),
  })

  const resolvedViews = useMemo(
    () => {
      return _viewsFromStageQueries({
        viewsToResolve,
        queriesByStage: {
          confSchema: confSchemaQueries,
          metadata: metadataQueries,
          sources: sourcesQueries,
          layers: layersQueries,
          controls: controlsQueries,
          download: downloadQueries,
        },
      }).filter((partialView) => {
        // console.log(partialView)

        return _hasViewResolvedStages(partialView, [
          'metadata',
          'sources',
          'layers',
          // 'download',
        ])
      })
    },

    // () =>
    //   layersQueries
    //     .filter((query) => query.status === 'success')
    //     .map((query) => query.data)
    //     .filter(Boolean),
    [
      viewsToResolve,
      confSchemaQueries,
      metadataQueries,
      sourcesQueries,
      layersQueries,
      controlsQueries,
      downloadQueries,
    ],
  )

  const isLoading = useMemo(() => {
    return [
      ...metadataQueries,
      ...sourcesQueries,
      ...layersQueries,
      ...controlsQueries,
    ].some((query) => query.status === 'pending')
  }, [metadataQueries, sourcesQueries, layersQueries, controlsQueries])

  // console.log('=====================')
  // console.log(resolvedViews, viewConfState)

  //
  // Merge confSchema into viewConfState
  //
  const resolvedViewConfById = useMemo(() => {
    if (!viewConfState?.byId) {
      return null
    }

    const resolvedConfSchemasById = Object.fromEntries(
      viewsToResolve
        .map(({ viewId }, viewIndex) => {
          const confSchemaQuery = confSchemaQueries[viewIndex]

          return confSchemaQuery.status === 'success'
            ? [viewId, confSchemaQuery.data]
            : null
        })
        .filter(Boolean) as [string, Record<string, any>][],
    )

    return Object.fromEntries(
      Object.entries(viewConfState.byId).map(([viewId, viewConfBase]) => {
        const resolvedConfSchema = resolvedConfSchemasById[viewId]

        return [
          viewId,
          resolvedConfSchema
            ? {
                ...viewConfBase,
                confSchema: resolvedConfSchema,
              }
            : viewConfBase,
        ]
      }),
    )
  }, [viewsToResolve, viewConfState, confSchemaQueries])

  // console.log(resolvedViewConfById)

  // console.log('=====================')

  return {
    isLoading,
    confSchemaQueries,
    metadataQueries,
    sourcesQueries,
    layersQueries,
    controlsQueries,
    downloadQueries,
    resolvedViews,
    resolvedViewConfById,
  }
}
