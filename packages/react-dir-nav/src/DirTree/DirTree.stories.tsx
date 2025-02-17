import React from 'react'
import { makeDirTree } from './DirTree'
import { nodesFromPaths } from '@orioro/tree-model'

export default {
  title: 'DirTree',
}

const NODES = []

const DirTree = makeDirTree()

export const Basic = () => {
  return (
    <DirTree
      tree={nodesFromPaths([
        'Root 1 / Branch 11 / Branch 111',
        'Root 1 / Branch 11 / Branch 112',
        'Root 1 / Branch 12 / Branch 121',
        'Root 2 / Branch 21',
        'Root 2 / Branch 22 / 23',
      ]).map((node) => ({
        ...node,
        type: 'dir',
      }))}
    />
  )
}
