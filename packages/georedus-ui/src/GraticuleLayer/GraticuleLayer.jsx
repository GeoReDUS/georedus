import React, { useMemo, useCallback, useEffect, useState } from 'react'
import { Source, Layer } from 'react-map-gl/maplibre'
import { useMap } from 'react-map-gl/maplibre'

/**
 * Generates graticule GeoJSON data with lines and labels
 * @param {Object} bounds - Map bounds {west, south, east, north}
 * @param {number} zoom - Current zoom level
 * @param {Object} options - Generation options
 * @returns {Object} GeoJSON feature collection
 */
function generateGraticuleData(bounds, zoom, options = {}) {
  if (!bounds) return { type: 'FeatureCollection', features: [] }

  const { includeGridLines = true, rulerStyle = false } = options
  const { west, south, east, north } = bounds

  // Determine interval based on zoom level
  let latInterval, lonInterval
  if (zoom < 3) {
    latInterval = lonInterval = 30
  } else if (zoom < 5) {
    latInterval = lonInterval = 15
  } else if (zoom < 7) {
    latInterval = lonInterval = 5
  } else if (zoom < 10) {
    latInterval = lonInterval = 1
  } else if (zoom < 13) {
    latInterval = lonInterval = 0.5
  } else {
    latInterval = lonInterval = 0.1
  }

  const features = []

  // Generate latitude lines and labels
  for (
    let lat = Math.ceil(south / latInterval) * latInterval;
    lat <= north;
    lat += latInterval
  ) {
    // Latitude line (only if not ruler style)
    if (includeGridLines && !rulerStyle) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [west, lat],
            [east, lat],
          ],
        },
        properties: {
          type: 'latitude',
          value: lat,
        },
      })
    }

    // Latitude tick marks on left edge
    if (rulerStyle) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [west, lat],
            [west + (east - west) * 0.02, lat], // Small tick mark
          ],
        },
        properties: {
          type: 'latitude-tick',
          value: lat,
        },
      })
    }

    // Latitude labels (at left and right edges)
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [west, lat],
      },
      properties: {
        type: 'latitude-label',
        value: lat,
        label: `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? 'N' : 'S'}`,
      },
    })

    if (!rulerStyle) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [east, lat],
        },
        properties: {
          type: 'latitude-label',
          value: lat,
          label: `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? 'N' : 'S'}`,
        },
      })
    }
  }

  // Generate longitude lines and labels
  for (
    let lon = Math.ceil(west / lonInterval) * lonInterval;
    lon <= east;
    lon += lonInterval
  ) {
    // Longitude line (only if not ruler style)
    if (includeGridLines && !rulerStyle) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [lon, south],
            [lon, north],
          ],
        },
        properties: {
          type: 'longitude',
          value: lon,
        },
      })
    }

    // Longitude tick marks on bottom edge
    if (rulerStyle) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [lon, south],
            [lon, south + (north - south) * 0.02], // Small tick mark
          ],
        },
        properties: {
          type: 'longitude-tick',
          value: lon,
        },
      })
    }

    // Longitude labels (at top and bottom edges)
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lon, south],
      },
      properties: {
        type: 'longitude-label',
        value: lon,
        label: `${Math.abs(lon).toFixed(1)}°${lon >= 0 ? 'E' : 'W'}`,
      },
    })

    if (!rulerStyle) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lon, north],
        },
        properties: {
          type: 'longitude-label',
          value: lon,
          label: `${Math.abs(lon).toFixed(1)}°${lon >= 0 ? 'E' : 'W'}`,
        },
      })
    }
  }

  return { type: 'FeatureCollection', features }
}

/**
 * GraticuleLayer Component
 * Renders a dynamic graticule (grid) with coordinate labels and borders
 *
 * @param {Object} props
 * @param {boolean} [props.showLines=true] - Show grid lines (full grid across the map)
 * @param {boolean} [props.showLabels=true] - Show coordinate labels
 * @param {boolean} [props.showBorders=false] - Show borders/rulers on edges of map
 * @param {boolean} [props.rulerStyle=true] - Use ruler style (only edges) instead of full grid
 * @param {string} [props.lineColor='rgba(0, 0, 0, 0.1)'] - Color of grid lines
 * @param {number} [props.lineWidth=1] - Width of grid lines
 * @param {string} [props.labelColor='rgba(0, 0, 0, 0.7)'] - Color of labels
 * @param {number} [props.labelSize=12] - Font size of labels
 * @param {number} [props.borderWidth=2] - Width of border/tick lines
 * @param {string} [props.borderColor='rgba(0, 0, 0, 0.3)'] - Color of border/tick lines
 */
export function GraticuleLayer({
  showLines = false,
  showLabels = true,
  showBorders = true,
  rulerStyle = true,
  lineColor = 'rgba(0, 0, 0, 0.1)',
  lineWidth = 1,
  labelColor = 'rgba(0, 0, 0, 0.8)',
  labelSize = 12,
  borderWidth = 2,
  borderColor = 'rgba(0, 0, 0, 0.3)',
} = {}) {
  const { current: map } = useMap()
  const [graticuleData, setGraticuleData] = useState({
    type: 'FeatureCollection',
    features: [],
  })

  // Update graticule data when map bounds or zoom changes
  const updateGraticule = useCallback(() => {
    if (!map) return

    const bounds = map.getBounds()
    const zoom = map.getZoom()

    const data = generateGraticuleData(
      {
        west: bounds.getWest(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        north: bounds.getNorth(),
      },
      zoom,
      {
        includeGridLines: showLines,
        rulerStyle,
      },
    )

    setGraticuleData(data)
  }, [map, showLines, rulerStyle])

  // Set up event listeners for map changes
  useEffect(() => {
    if (!map) return

    updateGraticule()

    map.on('moveend', updateGraticule)
    map.on('zoomend', updateGraticule)

    return () => {
      map.off('moveend', updateGraticule)
      map.off('zoomend', updateGraticule)
    }
  }, [map, updateGraticule])

  return (
    <>
      <Source id="graticule-source" type="geojson" data={graticuleData}>
        {showLines && !rulerStyle && (
          <Layer
            id="graticule-lines"
            type="line"
            source="graticule-source"
            filter={['in', ['get', 'type'], ['literal', ['latitude', 'longitude']]]}
            paint={{
              'line-color': lineColor,
              'line-width': lineWidth,
              'line-opacity': 0.5,
            }}
          />
        )}

        {showBorders && rulerStyle && (
          <Layer
            id="graticule-ticks"
            type="line"
            source="graticule-source"
            filter={[
              'in',
              ['get', 'type'],
              ['literal', ['latitude-tick', 'longitude-tick']],
            ]}
            paint={{
              'line-color': borderColor,
              'line-width': borderWidth,
              'line-opacity': 0.8,
            }}
            layout={{
              'line-cap': 'round',
              'line-join': 'round',
            }}
          />
        )}

        {showBorders && !rulerStyle && (
          <Layer
            id="graticule-borders"
            type="line"
            source="graticule-source"
            filter={['in', ['get', 'type'], ['literal', ['latitude', 'longitude']]]}
            paint={{
              'line-color': borderColor,
              'line-width': borderWidth,
              'line-opacity': 0.7,
            }}
            layout={{
              'line-cap': 'round',
              'line-join': 'round',
            }}
          />
        )}

        {showLabels && (
          <Layer
            id="graticule-labels"
            type="symbol"
            source="graticule-source"
            filter={[
              'in',
              ['get', 'type'],
              ['literal', ['latitude-label', 'longitude-label']],
            ]}
            layout={{
              'text-field': ['get', 'label'],
              'text-size': labelSize,
              'text-anchor': 'center',
              'text-offset': [0, 0],
              'text-allow-overlap': false,
              'text-ignore-placement': false,
            }}
            paint={{
              'text-color': labelColor,
              'text-halo-color': 'rgba(255, 255, 255, 0.8)',
              'text-halo-width': 1,
              'text-opacity': 0.9,
            }}
          />
        )}
      </Source>
    </>
  )
}

export default GraticuleLayer
