import React from 'react'
import { useControl } from 'react-map-gl/maplibre'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import maplibregl from 'maplibre-gl'
import { applyReactStyle } from '../../util'

export type ControlContainerProps = {
  /** Optional style for the outer container */
  style?: React.CSSProperties
  /** Optional position in MapLibre control bar */
  position?: maplibregl.ControlPosition
  /** Button content and props */
  children: React.ReactNode
}

export function ControlContainer({
  style,
  position = 'top-right',
  children,
}: ControlContainerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [mountPoint, setMountPoint] = useState<HTMLDivElement | null>(null)

  useControl(
    () => {
      const container = document.createElement('div')
      container.className = 'maplibregl-ctrl maplibregl-ctrl-group'

      const mount = document.createElement('div')
      container.appendChild(mount)

      containerRef.current = container
      setMountPoint(mount)

      return {
        onAdd(map) {
          mapRef.current = map
          return container
        },
        onRemove() {
          container.remove()
          mapRef.current = null
        },
      }
    },
    { position },
  )

  useEffect(() => {
    if (style && containerRef.current) {
      applyReactStyle(containerRef.current, style)
    }
  }, [style])

  return mountPoint ? createPortal(children, mountPoint) : null
}

function ControlContainerWithStyleReset({
  style = {},
  ...props
}: ControlContainerProps) {
  return (
    <ControlContainer
      {...props}
      style={{
        ...style,
        boxShadow: 'none',
        borderRadius: 0,
      }}
    />
  )
}

ControlContainer.Unstyled = ControlContainerWithStyleReset
