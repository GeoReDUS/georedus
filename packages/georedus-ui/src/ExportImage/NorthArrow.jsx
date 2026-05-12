import React, { useEffect, useRef, useState } from 'react'
import { useControl, useMap } from 'react-map-gl/maplibre'
import { createPortal } from 'react-dom'
import maplibregl from 'maplibre-gl'
import styled from 'styled-components'
import { Icon } from '@mdi/react'
import { mdiNavigation } from '@mdi/js'
import { ControlContainer } from '@orioro/react-maplibre-util'

const style = {
  border: 'none',
  borderRadius: '70px',

  backgroundColor: 'transparent',
}

const circleStyle = {
  border: '2px solid black',
  borderRadius: '70px',
  padding: '4px',
  width: '30px',
  height: '30px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const ArrowIcon = styled(Icon)`
  transform: rotate(${(props) => -props.bearing}deg);
`

/**
 * NorthArrow Control Component
 *
 * Displays a rotatable north arrow that syncs with the map's bearing.
 * Click to reset the map bearing to 0°.
 *
 * @param {Object} props
 * @param {string} [props.position='bottom-right'] - Position in MapLibre control bar
 * @param {React.CSSProperties} [props.style] - Additional styles for the container
 */

export function NorthArrow({ position = 'bottom-right', className }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const [mountPoint, setMountPoint] = useState(null)
  const [bearing, setBearing] = useState(0)
  const mapContext = useMap()

  // Register as a MapLibre control
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
          if (containerRef.current) {
            containerRef.current.remove()
          }
          mapRef.current = null
        },
      }
    },
    { position },
  )

  // Listen to map bearing changes
  useEffect(() => {
    const map = mapRef.current || mapContext?.current?.getMap?.()
    if (!map) return

    const handleMove = () => {
      setBearing(map.getBearing())
    }
    setBearing(map.getBearing())
    map.on('move', handleMove)

    return () => {
      map.off('move', handleMove)
    }
  }, [mapContext])

  // Handle reset bearing on click
  const handleClick = () => {
    const map = mapRef.current || mapContext?.current?.getMap?.()
    if (map && map.getBearing() !== 0) {
      map.easeTo({ bearing: 0 })
    }
  }

  return mountPoint
    ? createPortal(
        <ControlContainer
          onClick={handleClick}
          title="Click to reset bearing to north"
          style={style}
          position={position}>
          <div style={circleStyle} className={className}>
            <ArrowIcon
              path={mdiNavigation}
              size="25px"
              bearing={bearing}
              // style={{ marginTop: '3px' }}
            />
          </div>
        </ControlContainer>,
        mountPoint,
      )
    : null
}
