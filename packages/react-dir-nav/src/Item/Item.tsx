import React, { useContext, useMemo } from 'react'
import { Button, TextEllipsis, useComponents } from '@orioro/react-ui-core'
import { DirNavContext } from '../DirNav/DirNavContext'

export function Item({ node, depth }: { node: any; depth: number }) {
  const { onSelectItem } = useContext(DirNavContext)

  const onClick = useMemo(
    () =>
      typeof onSelectItem === 'function' ? () => onSelectItem(node) : undefined,
    [onSelectItem, node],
  )

  return (
    <div
      style={{
        paddingLeft: depth * 10,
      }}
    >
      <Button
        style={{
          width: '100%',
          justifyContent: 'flex-start',
          textAlign: 'left',
        }}
        type="Button"
        radius="none"
        onClick={onClick}
      >
        <TextEllipsis>{node.label}</TextEllipsis>
      </Button>
    </div>
  )
}
