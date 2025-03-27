import React from 'react'
import { makeDirTree } from './DirTree'
import { nodesFromPaths } from '@orioro/tree-model'

export default {
  title: 'DirTree',
}

const NODES = []

function generateTestNodes(count = 500) {
  const nodes = []
  let root = 1
  let branch = 1
  let subBranch = 1

  for (let i = 0; i < count; i++) {
    let parts = []

    // Add Root
    parts.push(`Root ${root}`)

    // Add Branch
    if (i % 2 === 0) {
      parts.push(`Branch ${root}${branch}`)
    }

    // Add Sub-Branch
    if (i % 3 === 0) {
      parts.push(`Branch ${root}${branch}${subBranch}`)
    }

    nodes.push(parts.join(' / '))

    // Update counters to keep variety
    subBranch++
    if (subBranch > 3) {
      subBranch = 1
      branch++
      if (branch > 5) {
        branch = 1
        root++
      }
    }
  }

  return nodes
}

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

export const LargeTree = () => {
  return (
    <DirTree
      tree={nodesFromPaths(generateTestNodes(2_000)).map((node) => ({
        ...node,
        type: 'dir',
      }))}
    />
  )
}
