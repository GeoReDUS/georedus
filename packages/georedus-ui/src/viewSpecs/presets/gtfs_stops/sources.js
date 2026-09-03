import { parseTiles } from '../util'

export const MAIN_SOURCE_ID = 'main'

export function sources(viewSpec, allViewSpecs, context) {
  const { tiles } = viewSpec

  return {
    [MAIN_SOURCE_ID]: {
      promoteId: 'ogc_fid',
      type: 'vector',
      tiles: parseTiles(tiles, context),
    },
  }
}
