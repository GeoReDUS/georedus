import { interpolate } from '@orioro/util'
import { resolveAsync } from '@orioro/resolve'
import { COLOR_SCHEMES } from '../../../util'
import { COLOR_SCALE_STOPS_RESOLVERS } from './colorScaleStopResolvers'

export function metadata(viewSpec, allViewSpecs, context) {
  const { style } = viewSpec

  const radiusData = style.radius?.values
    ? resolveAsync.fn(async (ctx) => {
        //
        // resolve values
        //
        const resolvedValues = (
          typeof style.radius.values === 'string'
            ? // style.radius.values is an URL
              await fetch(
                interpolate(style.radius.values, {
                  METADATA_API_ENDPOINT: context.METADATA_API_ENDPOINT,
                  municipioId: context.municipioId,

                  //
                  // TODO: remove these hotfixes
                  //
                  municipioId_SUS: context.municipioId.substr(0, 6),
                }),
              ).then((res) => res.json())
            : Array.isArray(style.radius.values)
              ? style.radius.values
              : null
        )
          .map((entry) => (typeof entry === 'number' ? entry : entry.value))
          .filter((entry) => entry < 60)

        //
        // Resolve color scale stops
        //
        const colorSchemeId =
          ctx.view.conf?.style?.colorScheme || style.colorScheme
        const colorScheme =
          COLOR_SCHEMES[colorSchemeId] || COLOR_SCHEMES.schemeBuOrRd

        const _classificationMethod = {
          ...(style.radius.classificationMethod || {}),
          type:
            ctx.view.conf.style?.classificationMethodType ||
            style.radius.classificationMethod?.type,
          k:
            ctx.view.conf.style?.classificationMethodK ||
            style.radius.classificationMethod?.k,
        }

        const { colorScaleStops, hasLowerValues } = COLOR_SCALE_STOPS_RESOLVERS[
          _classificationMethod.type
        ]({
          values: resolvedValues,
          colorScheme,
          classificationMethod: _classificationMethod,
        })

        return {
          values: resolvedValues,
          colorScaleStops,
          hasLowerValues,
        }
      })
    : null

  return {
    radiusData,
  }
}
