import React, { forwardRef, useCallback } from 'react'
import { useHover } from './useHover'

function useMergedCallback(cbA, cbB) {
  return useCallback(
    (...args) => {
      if (typeof cbA === 'function') {
        cbA(...args)
      }
      if (typeof cbB === 'function') {
        cbB(...args)
      }
    },
    [cbA, cbB],
  )
}

export function withHover(Component, withHoverProps) {
  return forwardRef(function WithHover(
    { cursor, onMouseMove, onDragStart, onDragEnd, children, ...restProps },
    ref,
  ) {
    //
    // Hover stuff
    //
    const [hoverProps] = useHover(withHoverProps, [])
    return (
      <Component
        {...restProps}
        ref={ref}
        cursor={cursor || hoverProps.cursor}
        onMouseMove={useMergedCallback(onMouseMove, hoverProps.onMouseMove)}
        onDragStart={useMergedCallback(onDragStart, hoverProps.onDragStart)}
        onDragEnd={useMergedCallback(onDragEnd, hoverProps.onDragEnd)}
      >
        {hoverProps.children}
        {children}
      </Component>
    )
  })
}
