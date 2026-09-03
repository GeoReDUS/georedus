import { resolveAsync } from '@orioro/resolve'
import { interpolate } from '@orioro/util'
import { uniqBy } from 'lodash'
import { resolveCategoricalSchemeColor } from '../../util'
import { humanize, CUSTOM_COLOR_SCHEME } from '../util'

export function metadata(viewSpec, allViewSpecs, context) {
  const { style } = viewSpec

  const categories = resolveAsync.fn(async (ctx) => {
    // Resolve color scheme
    const colorSchemeId =
      ctx.view?.conf?.style?.colorScheme || style.colorScheme

    // resolve categories
    const resolvedCategories =
      typeof style.categories === 'string'
        ? // style.categories is an URL
          await fetch(
            interpolate(style.categories, {
              METADATA_API_ENDPOINT: context.METADATA_API_ENDPOINT,
              municipioId: context.municipioId,
            }),
          )
            .then((res) => res.json())
            .then((categories) =>
              uniqBy(categories, (cat) => cat.value).filter(
                (cat) => cat.value !== null,
              ),
            )
        : Array.isArray(style.categories)
          ? style.categories.map((categoryInput) =>
              typeof categoryInput === 'string'
                ? {
                    value: categoryInput,
                  }
                : categoryInput,
            )
          : null

    if (!resolvedCategories) {
      throw new Error('could not resolve categories ' + viewSpec.id)
    }

    return resolvedCategories.map((cat, index) => {
      // Will only use cat.color if there is not coloScheme defined
      const color =
        colorSchemeId === CUSTOM_COLOR_SCHEME
          ? cat.color
          : resolveCategoricalSchemeColor(colorSchemeId, index)

      if (!color) {
        throw new Error(`Could not resolve color for ${cat.value}`)
      }

      return {
        ...cat,
        color,
        label: cat.label || humanize(cat.value),
      }
    })
  })

  return {
    categories,
  }
}
