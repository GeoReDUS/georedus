import { resolve } from '@orioro/resolve'
import { parseTiles } from '../util'
import { get } from '@orioro/get'

export const SOURCE_LAYER_ID = 'cem_malha_hex_res9.geom'

export function sources(viewSpec, allViewSpecs, context) {
  const { tiles, style } = viewSpec
  const { VECTOR_TILE_SERVER_ENDPOINT, METADATA_API_ENDPOINT } = context

  return {
    main: {
      promoteId: 'id',
      type: 'vector',
      minzoom: 9,

      tiles: [
        resolve.fn((ctx) => {
          const baseTilesUrl = `${VECTOR_TILE_SERVER_ENDPOINT}/cem_malha_hex_res9.geom/{z}/{x}/{y}`
          const selectedHexFrom = get(ctx, 'view.conf.data.selectedHexFrom')

          return selectedHexFrom
            ? [
                '$vtxUrl',
                {
                  tiles: baseTilesUrl,
                  data: [
                    [
                      'id_hex:id',
                      `${METADATA_API_ENDPOINT}/cem_gtfs_travel_time?` +
                        `hex_from=eq.${selectedHexFrom}&` +
                        `select=id:hex_to,time_min`,
                    ],
                  ],
                },
              ]
            : baseTilesUrl
        }),
      ],
      // tiles: parseTiles(tiles, context),
    },
  }
}
