import {
  ResolvedView,
  ViewResolutionContextBase,
  ViewSpec,
  ViewStageKey,
} from '../types'
import {
  resolveControls,
  resolveDownload,
  resolveLayers,
  resolveMetadata,
  resolveSources,
} from '../resolveView'

export const STAGE_LOADING = Symbol.for('STAGE_LOADING')
export const STAGE_ERROR = Symbol.for('STAGE_ERROR')

/**
 * How a pipeline stage declares its upstream dependencies.
 *
 * - `null`                  — no dependencies; stage is always enabled
 * - `'all_previous_stages'` — depends on all stages from every group that
 *                             precedes this stage's group in `PIPELINE_STAGES`.
 *                             Stages in the same group are parallel and are NOT
 *                             included. Correct default for most stages, including
 *                             parallel ones like `controls` and `download`.
 * - `ViewStageKey[]`        — explicit list for cases where only a subset of
 *                             upstream stages should invalidate this one
 */
export type StageDependencies = null | 'all_previous_stages' | ViewStageKey[]

export type PipelineStage = {
  stageKey: ViewStageKey
  dependsOnStages: StageDependencies
  resolveFn: (
    viewSpec: ViewSpec,
    partialView: Partial<ResolvedView>,
    ctx: ViewResolutionContextBase,
  ) => Promise<unknown>
}

export const PIPELINE_STAGES: PipelineStage[][] = [
  [{ stageKey: 'metadata', dependsOnStages: null, resolveFn: resolveMetadata }],
  [
    {
      stageKey: 'sources',
      dependsOnStages: 'all_previous_stages',
      resolveFn: resolveSources,
    },
  ],
  [
    {
      stageKey: 'layers',
      dependsOnStages: 'all_previous_stages',
      resolveFn: resolveLayers,
    },
  ],
  // controls and download are parallel — same group means neither depends on the other
  [
    {
      stageKey: 'controls',
      dependsOnStages: 'all_previous_stages',
      resolveFn: resolveControls,
    },
    {
      stageKey: 'download',
      dependsOnStages: 'all_previous_stages',
      resolveFn: resolveDownload,
    },
  ],
]
