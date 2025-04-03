import React, { useState } from 'react'
import { Map as MapLibreMap } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapWindow } from './MapWindow'

export default {
  title: 'MapWindow',
  parameters: {
    layout: 'fullscreen',
  },
}

const DATAVIZ_STYLE = `https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.STORYBOOK_MAP_TILER_API_KEY}`
const SATELLITE_STYLE = `https://api.maptiler.com/maps/satellite/style.json?key=${process.env.STORYBOOK_MAP_TILER_API_KEY}`

export const Basic = () => {
  const [mapStyles, setMapStyles] = useState({
    main: DATAVIZ_STYLE,
    mini: SATELLITE_STYLE,
  })

  return (
    <MapLibreMap
      initialViewState={{
        zoom: 2,
      }}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        fontFamily: 'sans-serif',
      }}
      mapStyle={mapStyles.main}
    >
      <MapWindow
        initialViewState={{
          zoom: 2,
        }}
        style={{
          position: 'absolute',
          top: 100,
          right: 100,
          width: 300,
          height: 400,
          zIndex: 1,
        }}
        mapStyle={mapStyles.mini}
        attributionControl={false}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          right: 20,
          // top: `calc(50% + ${centerOffsetPixels.y}px)`,
          // left: `calc(50% + ${centerOffsetPixels.x}px)`,
          // transform: 'translate(-50%, -50%)',
          width: 100,
          height: 100,
          fontFamily: 'sans-serif',
          border: '1px solid white',
          boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px',
        }}
      >
        <MapWindow
          initialViewState={{
            zoom: 2,
          }}
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            zIndex: 1,
          }}
          mapStyle={mapStyles.mini}
          attributionControl={false}
        />
        <div
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            zIndex: 2,
            // opacity: 0.3,
            // background: 'white',
            cursor: 'pointer',
          }}
          onClick={() =>
            setMapStyles({
              main: mapStyles.mini,
              mini: mapStyles.main,
            })
          }
        />
      </div>
    </MapLibreMap>
  )
}
