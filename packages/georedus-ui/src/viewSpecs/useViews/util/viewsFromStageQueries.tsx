import { ResolvedView } from '../../types'
import { STAGE_ERROR, STAGE_LOADING } from '../constants'
import { QueriesByStage, ViewToResolve } from '../types'

/**
 * Merges query results into partial views. For each stage in `queriesByStage`,
 * assigns query data on success or a sentinel symbol (`STAGE_LOADING` /
 * `STAGE_ERROR`) otherwise. When `queriesByStage` is `null`, returns base
 * views with only `id` and `conf`.
 */
export function viewsFromStageQueries<
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
