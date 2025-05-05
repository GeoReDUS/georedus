import { isPlainObject, omit } from 'lodash'
import {
  ResolvedView,
  ResolvedViewConf,
  ViewSpec,
  ViewStageKey,
  ViewResolutionContextBase,
} from '../types'
import { resolveExpr, resolveExprAsync } from './resolveExpr'
import { get } from '@orioro/get'

export const STAGE_VALUE_KEY = '_value'

export const STAGE_SPECIAL_KEYS = [
  '_dependencies',
  '_loading',
  STAGE_VALUE_KEY,
  '_query',
]

function _stageResolver<
  PartialResolvedViewAtStage extends Partial<ResolvedView>,
  ReturnT,
>(
  stageKey: ViewStageKey,
  additionalResolveFn?: (
    partialRes: ReturnT,
    props: ViewResolutionContextBase & {
      viewSpec: ViewSpec
      view: Partial<ResolvedView>
    },
  ) => ReturnT | Promise<ReturnT>,
) {
  return async function (
    viewSpec: ViewSpec,
    partialViewAtStage: PartialResolvedViewAtStage,
    viewResolutionContextBase: ViewResolutionContextBase,
  ) {
    const resolveFinalContext = {
      //
      // TODO: We should move appContext to .app
      //
      ...viewResolutionContextBase.app,

      // This is the real vlaid structure
      ...viewResolutionContextBase,
      view: partialViewAtStage,
    }

    //
    // Apply common resolution
    //
    const stageValue =
      viewSpec[stageKey] && viewSpec[stageKey][STAGE_VALUE_KEY]
        ? viewSpec[stageKey][STAGE_VALUE_KEY]
        : isPlainObject(viewSpec[stageKey])
          ? omit(viewSpec[stageKey], STAGE_SPECIAL_KEYS)
          : viewSpec[stageKey]

    const resolved = (await resolveExprAsync(
      stageValue,
      resolveFinalContext,
    )) as ReturnT

    //
    // If there is an additional resolver provided, invoke it
    //
    return typeof additionalResolveFn === 'function'
      ? additionalResolveFn(resolved, { ...resolveFinalContext, viewSpec })
      : resolved
  }
}

// export const resolveConfSchema = _stageResolver<
//   Pick<ResolvedView, 'conf'>,
//   ResolvedView['conf']
// >('confSchema', (confSchema, { view, viewSpec }) => {
//   return confSchema || null
// })

export function resolveConfSchema(
  viewSpec: ViewSpec,
  partialView: Partial<ResolvedView>,
  viewResolutionContextBase: ViewResolutionContextBase,
): Partial<ResolvedView> {
  const resolveFinalContext = {
    //
    // TODO: We should move appContext to .app
    //
    ...viewResolutionContextBase.app,

    // This is the real vlaid structure
    ...viewResolutionContextBase,
    view: partialView,
  }

  return resolveExpr(viewSpec.confSchema, resolveFinalContext)
}

export const resolveMetadata = _stageResolver<
  Pick<ResolvedView, 'conf'>,
  ResolvedView['metadata']
>('metadata')

export const resolveSources = _stageResolver<
  Pick<ResolvedView, 'conf' | 'metadata'>,
  ResolvedView['sources']
>('sources')

export const resolveLayers = _stageResolver<
  Pick<ResolvedView, 'conf' | 'metadata' | 'sources'>,
  ResolvedView['layers']
>('layers', (layersBase, { view: VIEW_AT_LAYERS_STAGE }) => {
  //
  // Provide function that will resolve a tooltip
  // for a specific feature

  return Object.fromEntries(
    Object.entries(layersBase)
      .filter(
        ([layerId, layerBase]) => isPlainObject(layerBase) && !layerBase.hidden,
      )
      .map(([layerId, layerBase]) => {
        return [
          layerId,
          {
            ...layerBase,
            tooltip:
              layerBase.interactive !== false && layerBase.tooltip
                ? ({ feature }) =>
                    resolveExpr(layerBase.tooltip, {
                      feature,
                      view: VIEW_AT_LAYERS_STAGE,
                    })
                : null,
          },
        ]
      }),
  )
})

export const resolveControls = _stageResolver<
  Pick<ResolvedView, 'conf' | 'metadata' | 'sources' | 'layers'>,
  ResolvedView['controls']
>('controls', (controls = {}, { view, viewSpec }) => {
  console.log('resolve controls', controls)

  const layerLegends = view.layers
    ? get(
        Object.values(view.layers).filter(
          (layer) => !layer.hidden && layer.visibility !== 'none',
        ),
        '[].legends[]',
      )
        .filter(Boolean)
        .map((legend, index) => ({
          ...legend,
          id: `${viewSpec.id}_${index}`,
        }))
    : []

  return {
    ...(controls || {}),
    legends: [...(controls.legends || []), ...layerLegends],
  }
})

export const resolveDownload = _stageResolver<
  Pick<ResolvedView, 'conf' | 'metadata' | 'sources' | 'layers'>,
  ResolvedView['download']
>('download')

//
// Standalone function that applies view resolution
// in one go.
//
// Currently we are not using it, as we are applying
// partial query resolutions for each of the stages.
//
// See viewSpecs/useViews
//
export async function resolveView(
  viewSpec: ViewSpec,
  viewConf: ResolvedViewConf,
  viewResolutionContextBase: ViewResolutionContextBase,
) {
  const VIEW_AT_METADATA_STAGE = {
    id: viewSpec.id,
    conf: viewConf,
  }

  const metadata = await resolveMetadata(
    viewSpec,
    VIEW_AT_METADATA_STAGE,
    viewResolutionContextBase,
  )

  if (viewSpec.debug) {
    console.log('resolveView / metadata', metadata, {
      viewSpec,
      viewConf,
      viewResolutionContextBase,
    })
  }

  const VIEW_AT_SOURCES_STAGE = {
    ...VIEW_AT_METADATA_STAGE,
    metadata,
  }

  const sources = await resolveSources(
    viewSpec,
    VIEW_AT_SOURCES_STAGE,
    viewResolutionContextBase,
  )

  if (viewSpec.debug) {
    console.log('resolveView / sources', sources, {
      viewSpec,
      viewConf,
      viewResolutionContextBase,
    })
  }

  //
  // Resolve layers
  //
  const VIEW_AT_LAYERS_STAGE = {
    ...VIEW_AT_SOURCES_STAGE,
    sources,
  }

  const layers = await resolveLayers(
    viewSpec,
    VIEW_AT_LAYERS_STAGE,
    viewResolutionContextBase,
  )

  if (viewSpec.debug) {
    console.log('resolveView / layers', layers, {
      viewSpec,
      viewConf,
      viewResolutionContextBase,
    })
  }

  const VIEW_AT_CONTROLS_STAGE = {
    ...VIEW_AT_LAYERS_STAGE,
    layers,
  }

  const controls = await resolveControls(
    viewSpec,
    VIEW_AT_CONTROLS_STAGE,
    viewResolutionContextBase,
  )

  if (viewSpec.debug) {
    console.log('resolveView / controls', controls, {
      viewSpec,
      viewConf,
      viewResolutionContextBase,
    })
  }

  //
  // Resolve download function
  //
  const download = await resolveDownload(
    viewSpec,
    VIEW_AT_CONTROLS_STAGE,
    viewResolutionContextBase,
  )

  return {
    id: viewSpec.id,
    keywords: viewSpec.keywords,
    metadata,
    sources,
    layers,
    controls,
    download,
  }
}
