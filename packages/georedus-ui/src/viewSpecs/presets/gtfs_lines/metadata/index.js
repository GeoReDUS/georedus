import { interpolate } from '@orioro/util'
import { resolveAsync } from '@orioro/resolve'
import { WIDTH_SCALE_STOPS_RESOLVERS } from './widthScaleStopsResolvers'
import { WIDTH_MIN, WIDTH_MAX } from '../consts'
import { buildHourlyFieldNames } from '../../util/hourUtil'

export function metadata(viewSpec, allViewSpecs, context) {
  const { style } = viewSpec

  const valuesArray = buildHourlyFieldNames(style.lineWidth.valueKey)
  let valuesParam = ''
  for (let i = 0; i < 24; i++) {
    const param = valuesArray[i]
    valuesParam += i > 0 ? `,${param}:${param}` : `${param}:${param}`
  }

  const urlLayerValues = `${context.METADATA_API_ENDPOINT}/${style.lineWidth.viewKey}?cd_mun=eq.${style.lineWidth.cd_mun}&select=${valuesParam}`
  const urlAllValues = `${context.METADATA_API_ENDPOINT}/cem_gtfs_linhas?cd_mun=eq.${style.lineWidth.cd_mun}&select=${valuesParam}`

  const widthData = style.lineWidth
    ? resolveAsync.fn(async (ctx) => {
        const resolvedLayerValues = (
          await fetch(
            interpolate(urlLayerValues, {
              METADATA_API_ENDPOINT: context.METADATA_API_ENDPOINT,
              municipioId: context.municipioId,
            }),
          ).then((res) => res.json())
        ).map((entry) => {
          const headways = []
          valuesArray.forEach((key) => {
            headways.push(entry[key])
          })
          const frequencias = headways.map((h) => (h ? 60 / h : 0))
          return frequencias
        })

        const resolvedAllValues = (
          await fetch(
            interpolate(urlAllValues, {
              METADATA_API_ENDPOINT: context.METADATA_API_ENDPOINT,
              municipioId: context.municipioId,
            }),
          ).then((res) => res.json())
        ).map((entry) => {
          const headways = []
          valuesArray.forEach((key) => {
            headways.push(entry[key])
          })
          const frequencias = headways.map((h) => (h ? 60 / h : 0))
          return frequencias
        })

        const [periodFrom, periodTo] = ctx.view.conf?.style
          ?.periodHourSlider || [0, 24]

        const rangeAverage = (allRows, from, to) =>
          allRows.map((freqs) => {
            let sum = 0
            for (let j = from; j < to; j++) {
              sum += freqs[j]
            }
            return sum / (to - from)
          })

        // layerValues reflects the currently selected period, so the
        // rendered line width changes as the user moves the slider.
        const layerValues = rangeAverage(resolvedLayerValues, periodFrom, periodTo)

        // allValues (and therefore widthScaleStops) always spans the full
        // day, so the shared width scale/legend stays fixed regardless of
        // the period slider — only which bucket a line falls into changes.
        const allValues = rangeAverage(resolvedAllValues, 0, 24)

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
          values: allValues,
          classificationMethod: _classificationMethod,
          sizeMin: WIDTH_MIN,
          sizeMax: WIDTH_MAX,
        })

        return {
          values: layerValues,
          widthScaleStops,
        }
      })
    : null

  return {
    widthData,
  }
}
