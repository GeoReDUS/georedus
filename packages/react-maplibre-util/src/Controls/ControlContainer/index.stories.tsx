import React, { useState } from 'react'
import Map from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'

import { ControlContainer } from './index'

export default {
  title: 'ControlContainer',
  parameters: {
    layout: 'fullscreen',
  },
}

export const Basic = () => {
  const [value, setValue] = useState(false)

  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      <Map
        initialViewState={{
          latitude: -1.455833,
          longitude: -48.503887,
          zoom: 10,
        }}
        style={{ width: '100vw', height: '100vh' }}
        mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.STORYBOOK_MAP_TILER_API_KEY}`}
      >
        <ControlContainer position="top-right">
          <button
            onClick={() => {
              setValue(!value)
            }}
          >
            {value ? '1' : 0}
          </button>
        </ControlContainer>
        <ControlContainer position="bottom-right">
          <button
            onClick={() => {
              setValue(!value)
            }}
          >
            {value ? '1' : 0}
          </button>
          <button
            onClick={() => {
              setValue(!value)
            }}
          >
            {value ? '1' : 0}
          </button>
        </ControlContainer>
        <ControlContainer position="bottom-right">
          <button
            onClick={() => {
              setValue(!value)
            }}
          >
            {value ? '1' : 0}
          </button>
        </ControlContainer>
        <ControlContainer
          position="bottom-left"
          style={{
            boxShadow: 'none',
          }}
        >
          <code>{value ? JSON.stringify(value, null, 2) : 'null'}</code>
        </ControlContainer>
      </Map>
    </div>
  )
}
