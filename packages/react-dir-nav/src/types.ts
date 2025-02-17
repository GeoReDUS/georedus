import type { Node } from '@orioro/tree-model'
import React from 'react'
import styled from 'styled-components'

export type DirNode = Node & {
  open: boolean
}

export type DirNavNode = Node | DirNode

export type MakeDirNavProps = {
  components?: {
    Item?: React.FC<{ node: any; depth: number }>
    ItemContainer?: ReturnType<typeof styled.div>
    DirContainer?: ReturnType<typeof styled.div>
  }
}
