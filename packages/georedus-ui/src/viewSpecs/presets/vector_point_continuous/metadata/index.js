import { resolveAsync } from '@orioro/resolve'
import { parseUrl } from '../../util'

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
                parseUrl(style.radius.values, {
                  ...context,
                  app: {
                    ...context.app,
                    //
                    // TODO: remove this hotfix
                    //
                    municipioId_SUS: context.app.municipioId.substr(0, 6),
                  },
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
