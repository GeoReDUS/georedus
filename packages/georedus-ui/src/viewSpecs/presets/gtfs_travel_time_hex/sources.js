import { resolve } from '@orioro/resolve'
import { get } from '@orioro/get'
import { parseTiles } from '../util'
import { $urlSearch } from '../../resolveView/customExpr'

export function sources(viewSpec, allViewSpecs, context) {
  const { tiles, style } = viewSpec
  const { VECTOR_TILE_SERVER_ENDPOINT } = context

  return {
    main: {
      promoteId: style.originIdKey,
      type: 'vector',
      minzoom: style.minzoom,
      tiles: parseTiles(tiles, context),
    },
    travel_time: resolve.fn((ctx) => {
      const selectedHexFrom = get(ctx, 'view.conf.data.selectedHexFrom')

      if (!selectedHexFrom) {
        return null
      }

      return {
        type: 'vector',
        minzoom: style.minzoom,
        tiles: [
          `${VECTOR_TILE_SERVER_ENDPOINT}/dvt/{z}/{x}/{y}?${$urlSearch([
            {
              view: style.dvtView,
              select: [style.destKey, style.originKey, style.valueKey],
              where: {
                [style.originKey]: [selectedHexFrom],
              },
            },
          ])}`,
        ],
      }
    }),
  }
}
