import { makeTreeRenderer } from '@orioro/react-tree'
import { makeDir } from '../Dir'
import { Item } from '../Item'
import { MakeDirNavProps } from '../types'

export function makeDirTree(config?: MakeDirNavProps) {
  const Dir = makeDir(config)

  return makeTreeRenderer({
    components: {
      dir: Dir,
      item: config?.components?.Item || Item,
    },
  })
}
