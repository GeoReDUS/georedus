import { interpolate } from '@orioro/util'
import { resolveAsync } from '@orioro/resolve'
import { WIDTH_SCALE_STOPS_RESOLVERS } from './widthScaleStopsResolvers'
import { WIDTH_MIN, WIDTH_MAX } from '../consts'

export function metadata(viewSpec, allViewSpecs, context) {
  const { style } = viewSpec

  const widthData = style.lineWidth?.values
    ? resolveAsync.fn(async (ctx) => {
        //
        // resolve values
        //
        const rawEntries =
          typeof style.lineWidth.values === 'string'
            ? // style.lineWidth.values is an URL
              await fetch(
                interpolate(style.lineWidth.values, {
                  METADATA_API_ENDPOINT: context.METADATA_API_ENDPOINT,
                  municipioId: context.municipioId,
                }),
              ).then((res) => res.json())
            : Array.isArray(style.lineWidth.values)
              ? style.lineWidth.values
              : null

        const resolvedValues = rawEntries.map((entry) =>
          typeof entry === 'number' ? entry : entry.value,
        )

        const _classificationMethod = {
          ...(style.lineWidth.classificationMethod || {}),
          type:
            ctx.view.conf.style?.classificationMethodType ||
            style.lineWidth.classificationMethod?.type ||
            'naturalBreaks',
          k:
            ctx.view.conf.style?.classificationMethodK ||
            style.lineWidth.classificationMethod?.k ||
            5,
        }

        const widthScaleStops = WIDTH_SCALE_STOPS_RESOLVERS[
          _classificationMethod.type
        ]({
          values: resolvedValues,
          classificationMethod: _classificationMethod,
          sizeMin: WIDTH_MIN,
          sizeMax: WIDTH_MAX,
        })

        return {
          values: resolvedValues,
          widthScaleStops,
        }
      })
    : null

  return {
    widthData,
  }
}
