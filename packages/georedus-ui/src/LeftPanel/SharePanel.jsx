import React, { useRef, useState } from 'react'
import { Button, Flex } from '@orioro/react-ui-core'
import { ShareButtonBar } from '../ShareButtonBar'
import { LayeredMap } from '@orioro/react-maplibre-util'

import { Dialog } from '@radix-ui/themes'

// html2canvas does not support color functions
// radix uses: oklch and color(...)

// https://github.com/niklasvh/html2canvas/issues/2700

// import html2canvas from 'html2canvas-pro'
import { useQuery } from '@tanstack/react-query'

export function SharePanel({ syncedMapsRef, resolvedLayout, mapContainerRef }) {
  // Experimental image exporting
  console.log({ resolvedLayout })
  const viewState = {
    longitude: -48.48524076449485,
    latitude: -1.360099617508169,
    zoom: 11.722425124440363,
    pitch: 80,
    bearing: 24.94382625793764,
    padding: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
  }

  const SKY_STYLE = {
    'sky-color': '#199EF3',
    'sky-horizon-blend': 0.5,
    'horizon-color': '#d3edfd',
    'horizon-fog-blend': 0.5,
    'fog-color': '#0000ff',
    'fog-ground-blend': 0.5,
    'atmosphere-blend': [
      'interpolate',
      ['linear'],
      ['zoom'],
      0,
      1,
      10,
      1,
      12,
      0,
    ],
  }

  const imageBlobQuery = useQuery({
    queryKey: ['aaaa'],
    queryFn: async () => {
      // const canvas = await html2canvas(mapContainerRef.current)
      // const canvas = document.querySelector('canvas.maplibregl-canvas')
      const canvas = syncedMapsRef.current?.mapInstances?.[0].map.getCanvas()

      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            console.log({ blob })
            resolve(blob)
          } else {
            reject()
          }
        })
      })
    },
    retry: false,
    throwOnError: process.env.NODE_ENV !== 'production',
  })

  const layeredMapRef = useRef(null)

  const [exportImgSource, setExportImgSource] = useState(null)

  return (
    <>
      <Dialog.Title>Compartilhar</Dialog.Title>
      <Flex direction="row" gap="4">
        <Flex direction="column">
          <LayeredMap
            ref={layeredMapRef}
            sky={SKY_STYLE}
            maxPitch={80}
            mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.NEXT_PUBLIC_MAP_TILER_API_KEY}`}
            views={resolvedLayout?.[0]?.views}
            viewState={viewState}
            style={{
              height: '500px',
              width: '500px',
            }}
            canvasContextAttributes={{
              preserveDrawingBuffer: true,
            }}
          />
          <Button
            onClick={async () => {
              const canvas =
                layeredMapRef.current?.map.getCanvas()
              console.log({ canvas })
              const blob = await new Promise((resolve, reject) => {
                canvas.toBlob((blob) => {
                  if (blob) {
                    resolve(blob)
                  } else {
                    reject()
                  }
                })
              })
              setExportImgSource(URL.createObjectURL(blob))
            }}>
            Exportar Mapa
          </Button>
          {exportImgSource && (
            <img style={{ maxWidth: '100%' }} src={exportImgSource} />
          )}
        </Flex>
        <ShareButtonBar />
      </Flex>
    </>
  )
}
