import { resolveAsync } from '@orioro/resolve'
import { interpolate, slugify } from '@orioro/util'
import { uniqBy } from 'lodash'
import { resolveSchemeColor } from '../../util'
import { humanize } from '../util'

export function metadata(viewSpec, allViewSpecs, context) {
  const { style } = viewSpec

  const categories = resolveAsync.fn(async (ctx) => {
    // Resolve color scheme
    const colorSchemeId =
      ctx.view?.conf?.style?.colorScheme || 'schemeGeoReDUSSafe'

    // resolve categories
    const resolvedCategories =
      typeof style.categories === 'string'
        ? // style.categories is an URL
          await fetch(
            interpolate(style.categories, {
              METADATA_API_ENDPOINT: context.METADATA_API_ENDPOINT,
            }),
          )
            .then((res) => res.json())
            .then((categories) => uniqBy(categories, (cat) => cat.value))
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
      const color = cat.color || resolveSchemeColor(colorSchemeId, index)

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
