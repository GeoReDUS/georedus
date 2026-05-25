import { interpolate } from '@orioro/util'
import { resolveAsync } from '@orioro/resolve'

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
        ).map((entry) => (typeof entry === 'number' ? entry : entry.value))

        return {
          values: resolvedValues,
        }
      })
    : null

  return {
    radiusData,
  }
}
