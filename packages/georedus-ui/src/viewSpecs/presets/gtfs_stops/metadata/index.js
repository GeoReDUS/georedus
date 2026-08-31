import { interpolate } from '@orioro/util'
import { resolveAsync } from '@orioro/resolve'
import { COLOR_SCHEMES } from '../../../util'
import { COLOR_SCALE_STOPS_RESOLVERS } from './colorScaleStopResolvers'
import { buildHourlyFieldNames } from '../hourlyFields.js'

export function metadata(viewSpec, allViewSpecs, context) {
  const { style } = viewSpec

  const valuesArray = buildHourlyFieldNames(style.radius.valueKey)
  let valuesParam = ''
  for (let i = 0; i < 24; i++) {
    const param = valuesArray[i]
    valuesParam += i > 0 ? `,${param}:${param}` : `${param}:${param}`
  }

  const urlAllValues = `${context.METADATA_API_ENDPOINT}/cem_gtfs_estacoes?cd_mun=eq.${style.radius.cd_mun}&select=${valuesParam}`

  console.log('urlAllValues', urlAllValues)
  const radiusData = style.radius
    ? resolveAsync.fn(async (ctx) => {
        const resolvedAllValues = (
          await fetch(
            interpolate(urlAllValues, {
              METADATA_API_ENDPOINT: context.METADATA_API_ENDPOINT,
              municipioId: context.municipioId,
            }),
          ).then((res) => res.json())
        ).map((entry) => {
          const partidas = []
          valuesArray.forEach((key) => {
            partidas.push(entry[key])
          })
          return partidas
        })
        console.log('resolvedAllValues', resolvedAllValues)

        const [periodFrom, periodTo] = ctx.view.conf?.style
          ?.periodHourSlider || [0, 24]

        let resolvedValues = []
        for (let i = 0; i < resolvedAllValues.length; i++) {
          let sum = 0
          for (let j = periodFrom; j < periodTo; j++) {
            sum += resolvedAllValues[i][j]
          }
          resolvedValues.push(sum / (periodTo - periodFrom))
        }

        console.log('resolvedValues', resolvedValues)

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
