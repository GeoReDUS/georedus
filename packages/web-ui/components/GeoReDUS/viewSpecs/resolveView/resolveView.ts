import { ResolvedViewConf, ViewContext, ViewSpec } from '../types'
import { resolveExpr, resolveExprAsync } from './resolveExpr'
import { get } from '@orioro/get'

export async function resolveView(
  viewSpec: ViewSpec,
  viewConf: ResolvedViewConf,
  viewContext: ViewContext,
) {

  console.log(viewSpec)

  const VIEW_AT_METADATA_STAGE = {
    conf: viewConf,
  }
  const metadata = await resolveExprAsync(viewSpec.metadata, {
    ...viewContext,
    view: VIEW_AT_METADATA_STAGE,
  })

  if (viewSpec.debug) {
    console.log('resolveView / metadata', metadata, {
      viewSpec,
      viewConf,
      viewContext,
    })
  }

  const VIEW_AT_SOURCES_STAGE = {
    ...VIEW_AT_METADATA_STAGE,
    metadata,
  }
  const sources = await resolveExprAsync(viewSpec.sources, {
    ...viewContext,
    view: VIEW_AT_SOURCES_STAGE,
  })

  if (viewSpec.debug) {
    console.log('resolveView / sources', sources, {
      viewSpec,
      viewConf,
      viewContext,
    })
  }

  //
  // Resolve layers
  //
  const VIEW_AT_LAYERS_STAGE = {
    ...VIEW_AT_SOURCES_STAGE,
    sources,
  }
  const layersBase = await resolveExprAsync(viewSpec.layers, {
    ...viewContext,
    view: VIEW_AT_LAYERS_STAGE,
  })

  //
  // Provide function that will resolve a tooltip
  // for a specific feature
  //
  const layers = Object.fromEntries(
    Object.entries(layersBase).map(([layerId, layerBase]) => {
      return [
        layerId,
        {
          ...layerBase,
          tooltip: layerBase.tooltip
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

  if (viewSpec.debug) {
    console.log('resolveView / layers', layers, {
      viewSpec,
      viewConf,
      viewContext,
    })
  }

  const legends = get(Object.values(layers), '[].legends[]')
    .filter(Boolean)
    .map((legend, index) => ({
      ...legend,
      id: `${viewSpec.id}_${index}`,
    }))

  if (viewSpec.debug) {
    console.log('resolveView / legends', legends, {
      viewSpec,
      viewConf,
      viewContext,
    })
  }

  return {
    id: viewSpec.id,
    metadata,
    sources,
    layers,
    legends,
  }
}
