import { parseTiles } from '../util'

export const MAIN_SOURCE_ID = 'main'

function _formatColorMapQueryParamValue(categories) {
  return JSON.stringify(
    Object.fromEntries(categories.map((cat) => [`${cat.value}`, cat.color])),
  )
}

export function sources(viewSpec, allViewSpecs, context) {
  const { tiles, style } = viewSpec

  return {
    [MAIN_SOURCE_ID]: {
      minzoom: 9,
      maxzoom: 14,
      type: 'raster',
      tiles: parseTiles(tiles, context).map((url) => {
        const queryIndex = url.indexOf('?')
        const base = queryIndex === -1 ? url : url.slice(0, queryIndex)
        const query = queryIndex === -1 ? '' : url.slice(queryIndex + 1)

        const params = new URLSearchParams(query)
        const colormap =
          params.get('colormap') ||
          _formatColorMapQueryParamValue(style.categories)
        params.set('colormap', colormap)

        return `${base}?${params.toString()}`
      }),
    },
  }
}
