import { Node } from '@orioro/tree-model'
import { createContext } from 'react'

export const DirNavContext = createContext<{
  onSelectItem?: (node: Node) => any
}>({
  onSelectItem: undefined,
})
