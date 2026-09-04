import { ResolvedView, ViewStageKey } from '../../types'
import { STAGE_ERROR, STAGE_LOADING } from '../constants'

/**
 * Utility that checks whether a partial view
 * has all stages from a list resolved
 */
export function viewHasResolvedStages(
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
