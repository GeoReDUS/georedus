import { parseTiles } from '../util'

export function sources(viewSpec, allViewSpecs, context) {
  const { tiles } = viewSpec

  return {
    main: {
      promoteId: 'id',
      type: 'vector',
      tiles: parseTiles(tiles, context),
    },
  }
}
