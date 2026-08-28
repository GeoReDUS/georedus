import { interpolate } from '@orioro/util'
import { resolveAsync } from '@orioro/resolve'
import { WIDTH_SCALE_STOPS_RESOLVERS } from './widthScaleStopsResolvers'
import { WIDTH_MIN, WIDTH_MAX } from '../consts'

export function metadata(viewSpec, allViewSpecs, context) {
  const { style } = viewSpec

  const urlLayerValues = `${context.METADATA_API_ENDPOINT}/${style.lineWidth.viewKey}?select=value:${style.lineWidth.valueKey}&cd_mun=eq.${style.lineWidth.cd_mun}`
  const urlAllValues = `${context.METADATA_API_ENDPOINT}/cem_gtfs_linhas?select=value:${style.lineWidth.valueKey}&cd_mun=eq.${style.lineWidth.cd_mun}`

  const widthData = style.lineWidth
    ? resolveAsync.fn(async (ctx) => {
        const resolvedLayerValues = (
          await fetch(
            interpolate(urlLayerValues, {
              METADATA_API_ENDPOINT: context.METADATA_API_ENDPOINT,
              municipioId: context.municipioId,
            }),
          ).then((res) => res.json())
        ).map((entry) => (typeof entry === 'number' ? entry : entry.value))

        const resolvedAllValues = (
          await fetch(
            interpolate(urlAllValues, {
              METADATA_API_ENDPOINT: context.METADATA_API_ENDPOINT,
              municipioId: context.municipioId,
            }),
          ).then((res) => res.json())
        ).map((entry) => (typeof entry === 'number' ? entry : entry.value))

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
          values: resolvedAllValues,
          classificationMethod: _classificationMethod,
          sizeMin: WIDTH_MIN,
          sizeMax: WIDTH_MAX,
        })

        return {
          values: resolvedLayerValues,
          widthScaleStops,
        }
      })
    : null

  return {
    widthData,
  }
}
