import React, { useRef, useState } from 'react'
import { Button, Flex, Spinner } from '@orioro/react-ui-core'
import { ShareButtonBar } from '../ShareButtonBar'
import { LayeredMap, ControlContainer } from '@orioro/react-maplibre-util'
import { toBlob } from 'html-to-image'

import { Dialog } from '@radix-ui/themes'

import { Legend } from '@orioro/react-chart-util'

import styled from 'styled-components'

import {
  ScaleControl,
  AttributionControl,
} from 'react-map-gl/maplibre'

// html2canvas does not support color functions
// radix uses: oklch and color(...)

// https://github.com/niklasvh/html2canvas/issues/2700

// import html2canvas from 'html2canvas-pro'
import { useQuery } from '@tanstack/react-query'

export function SharePanel({ syncedMapsRef, resolvedLayout, mapContainerRef }) {
  // Experimental image exporting
  const viewState = {
    //está chumbado
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

  // const imageBlobQuery = useQuery({
  //   queryKey: ['aaaa'],
  //   queryFn: async () => {
  //     // const canvas = await html2canvas(mapContainerRef.current)
  //     // const canvas = document.querySelector('canvas.maplibregl-canvas')
  //     const canvas = syncedMapsRef.current?.mapInstances?.[0].map.getCanvas()

  //     return new Promise((resolve, reject) => {
  //       canvas.toBlob((blob) => {
  //         if (blob) {
  //           resolve(blob)
  //         } else {
  //           reject()
  //         }
  //       })
  //     })
  //   },
  //   retry: false,
  //   throwOnError: process.env.NODE_ENV !== 'production',
  // })

  const layeredMapRef = useRef(null)

  
  const legends = resolvedLayout?.[0]?.legends || []
  
  const LegendContainer = styled(Flex)`
  box-shadow:
  rgba(0, 0, 0, 0.1) 0px 4px 6px -1px,
  rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;
  background-color: white;
  border-radius: 4px;
  `
  
  const legendMapRef = useRef(null)
  
  // const [exportImgSource, setExportImgSource] = useState(null)
  // const [legendImage, setLegendImage] = useState(null)
  const [imageIsLoading, setImageIsLoading] = useState(false)
  const [combinedImage, setCombinedImage] = useState(null)

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
            initialViewState={viewState}
            onLoad={() => alert('map loaded')}
            style={{
              height: '500px',
              width: '500px',
            }}
            canvasContextAttributes={{
              preserveDrawingBuffer: true,
            }}>
              <ScaleControl position="bottom-right" />
              <AttributionControl position="bottom-right" compact={false} />
            </LayeredMap>
          <LegendContainer
            ref={legendMapRef}
            direction="column"
            gap="3"
            p={resolvedLayout.length > 1 ? '3' : '4'}>
            {legends
              .filter((legend) => legend?.type)
              .map((legend, i) => (
                <Legend key={legend.id || `${legend.type}-${i}`} {...legend} />
              ))}
          </LegendContainer>
          <Button
            onClick={async () => {
              // Wait for map to be available
              setImageIsLoading(true)

              let mapCanvas
              while (!mapCanvas) {
                await new Promise((r) => setTimeout(r, 1000))
                mapCanvas = layeredMapRef.current?.map?.getCanvas()
              }

              const blobLegend = await toBlob(legendMapRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                fontEmbedCSS: false,
              })

              // Convert legend blob to image (only time we need to convert)
              const legendImg = await new Promise((resolve) => {
                const img = new Image()
                img.onload = () => resolve(img)
                img.src = URL.createObjectURL(blobLegend)
              })

              // Create combined canvas and draw directly
              const combinedCanvas = document.createElement('canvas')

              // Set internal resolution
              combinedCanvas.width = 3508
              combinedCanvas.height = 2480

              const ctx = combinedCanvas.getContext('2d')

              ctx.drawImage(mapCanvas, 100, 100, 2280, 2280)
              ctx.drawImage(legendImg, 2480, 70, 928, 928 * (legendImg.height / legendImg.width))

              // Convert combined result to blob once
              combinedCanvas.toBlob((blob) => {
                setCombinedImage(URL.createObjectURL(blob))
              })

              setImageIsLoading(false)
            }}>
            Exportar Mapa
          </Button>
          {imageIsLoading && <Spinner />}
          {/* {exportImgSource && (
            <img style={{ maxWidth: '100%' }} src={exportImgSource} />
          )}
          {legendImage && (
            <img style={{ maxWidth: '100%' }} src={legendImage} />
          )} */}
          {combinedImage && (
            <img style={{ maxWidth: '100%' }} src={combinedImage} />
          )}
        </Flex>
        <ShareButtonBar />
      </Flex>
    </>
  )
}
