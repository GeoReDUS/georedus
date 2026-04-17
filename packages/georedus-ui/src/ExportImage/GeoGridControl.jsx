import { useEffect, useRef } from 'react'
import { useMap } from 'react-map-gl/maplibre'
import { GeoGrid } from 'geogrid-maplibre-gl'
import 'geogrid-maplibre-gl/dist/geogrid.css'

// Default formatter for coordinates
const defaultFormatLabels = (degreesFloat) => {
  const degrees = Math.floor(Math.abs(degreesFloat))
  const minutesFloat = (Math.abs(degreesFloat) - degrees) * 60
  const minutes = Math.floor(minutesFloat)
  const seconds = Math.floor((minutesFloat - minutes) * 60)
  return `${degrees}°${minutes}'${seconds}''`
}

export function GeoGridControl({
  enabled = true,
  gridStyle,
  labelStyle,
  beforeLayerId,
  zoomLevelRange,
  gridDensity,
  formatLabels = defaultFormatLabels,
} = {}) {
  const mapRef = useMap()
  const geoGridRef = useRef(null)

  useEffect(() => {
    const map = mapRef.current?.getMap?.()
    if (!map) {
      return
    }

    const setupGeoGrid = () => {
      // If GeoGrid exists and enabled is false, remove it
      if (geoGridRef.current && !enabled) {
        try {
          geoGridRef.current.remove()
        } catch (error) {
          console.error('Error removing GeoGrid:', error)
        }
        geoGridRef.current = null
        return
      }

      // If enabled is false and doesn't exist, nothing to do
      if (!enabled) {
        return
      }

      // If GeoGrid already exists and enabled is true, don't recreate
      if (geoGridRef.current) {
        return
      }

      // Create new GeoGrid instance
      const defaultLabelStyle = {
        color: 'rgba(0, 0, 0, 0.7)',
        fontSize: 14,
        textShadow: '1px 1px 2px rgba(255, 255, 255, 0.8)',
      }

      const options = {
        map,
        ...(beforeLayerId && { beforeLayerId }),
        ...(gridStyle && { gridStyle }),
        labelStyle: labelStyle || defaultLabelStyle,
        ...(zoomLevelRange && { zoomLevelRange }),
        ...(gridDensity && { gridDensity }),
        formatLabels,
      }

      try {
        console.log('Creating GeoGrid with options:', options)
        geoGridRef.current = new GeoGrid(options)
        console.log('GeoGrid created successfully')
      } catch (error) {
        console.error('Error creating GeoGrid:', error)
      }
    }

    // Wait for style to load
    if (map.isStyleLoaded()) {
      setupGeoGrid()
    } else {
      map.on('style.load', setupGeoGrid)
    }

    // Cleanup
    return () => {
      map.off('style.load', setupGeoGrid)
      if (geoGridRef.current && !enabled) {
        try {
          geoGridRef.current.remove()
        } catch (error) {
          console.error('Error removing GeoGrid on cleanup:', error)
        }
        geoGridRef.current = null
      }
    }
  }, [
    mapRef,
    enabled,
    gridStyle,
    labelStyle,
    beforeLayerId,
    zoomLevelRange,
    gridDensity,
    formatLabels,
  ])

  return null
}
