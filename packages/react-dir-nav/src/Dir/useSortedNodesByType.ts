import { Node } from '@orioro/tree-model'
import { groupBy } from 'lodash-es'
import { useMemo } from 'react'

export function useSortedNodesByType(nodes: Node[] | null = null) {
  return useMemo(() => {
    const sorted = (nodes || []).sort((nA, nB) => {
      if (nA.label && nB.label) {
        return nA.label.toLowerCase() < nB.label.toLowerCase() ? -1 : 1
      } else if (!nA.label) {
        return 1
      } else if (!nB.label) {
        return -1
      } else {
        return -1
      }
    })

    return groupBy(sorted, (node) => (node.type === 'dir' ? 'dir' : 'item'))
  }, [nodes])
}
