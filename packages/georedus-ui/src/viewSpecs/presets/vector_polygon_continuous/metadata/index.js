import { interpolate } from '@orioro/util'
import { resolveAsync } from '@orioro/resolve'
import { COLOR_SCHEMES } from '../../../util'

import { COLOR_SCALE_STOPS_RESOLVERS } from './colorScaleStopResolvers'

export function metadata(viewSpec, allViewSpecs, context) {
  const { style } = viewSpec

  return resolveAsync.fn(async (ctx) => {
    //
    // resolve values
    //
    const resolvedValues = (
      typeof style.values === 'string'
        ? // style.values is an URL
          await fetch(
            interpolate(style.values, {
              METADATA_API_ENDPOINT: context.METADATA_API_ENDPOINT,
              municipioId: context.municipioId,
            }),
          ).then((res) => res.json())
        : Array.isArray(style.values)
          ? style.values
          : null
    ).map((entry) => (typeof entry === 'number' ? entry : entry.value))

    //
    // Resolve color scale stops
    //
    // When the style hard-codes a `custom` classification (fixed breaks
    // defined in the view spec, e.g. a percentage 0-1 scale), the whole
    // color styling isn't meant to be switched via confSchema (which
    // doesn't even offer `custom` as an option for classificationMethodType)
    // — always honor `style.colorScheme`/`style.classificationMethod`
    // as-is, ignoring any conf override.
    //
    const isCustomClassification = style.classificationMethod?.type === 'custom'

    const colorSchemeId = isCustomClassification
      ? style.colorScheme
      : ctx.view.conf?.style?.colorScheme || style.colorScheme
    const colorScheme = COLOR_SCHEMES[colorSchemeId] || COLOR_SCHEMES.schemeOrRd

    const _classificationMethod = isCustomClassification
      ? style.classificationMethod
      : {
            ...(style.classificationMethod || {}),
            type:
              ctx.view.conf.style?.classificationMethodType ||
              style.classificationMethod?.type,
            k:
              ctx.view.conf.style?.classificationMethodK ||
              style.classificationMethod?.k,
          }

    const colorScaleStops = COLOR_SCALE_STOPS_RESOLVERS[
      _classificationMethod.type
    ]({
      values: resolvedValues,
      colorScheme,
      classificationMethod: _classificationMethod,
    })

    return {
      values: resolvedValues,
      colorScaleStops,
    }
  })
}
