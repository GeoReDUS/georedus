import { useRef, useState } from 'react'
import { useLocation } from 'react-use'
import { Button, Flex, Spinner } from '@orioro/react-ui-core'
import { LayeredMap, ControlContainer } from '@orioro/react-maplibre-util'
import { toBlob } from 'html-to-image'

import { Legend } from '@orioro/react-chart-util'
import QRCode from 'react-qr-code'

import styled from 'styled-components'
import { SKY_STYLE } from '../GeoReDUS/constants'
import {
  ScaleControl,
  AttributionControl,
  GeolocateControl,
  NavigationControl,
} from 'react-map-gl/maplibre'

import { GeoReDUSLogo } from '../GeoReDUSLogo'
import { Heading, Text, Strong } from '@radix-ui/themes'

export function ExportImage({ resolvedLayout, commitedViewState }) {
  console.log('resolvedLayout', resolvedLayout)
  console.log('commitedViewState', commitedViewState)
  const layeredMapRef = useRef(null)

  const legends = resolvedLayout?.[0]?.legends || []

  const LegendContainer = styled(Flex)`
    background-color: white;
    border-radius: 4px;
  `

  const legendMapRef = useRef(null)

  const [imageIsLoading, setImageIsLoading] = useState(false)
  const [combinedImage, setCombinedImage] = useState(null)

  const { href } = useLocation()

  function ImageDescription() {
    return (
      <>
        <Flex direction="column">
          <Flex height="100%">
            <Heading size="6" color="iris">
              São Paulo - SP/BR
            </Heading>
            <Heading size="3" color="iris">
              {new Date()
                .toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })
                .replace(/\//g, '.')}
            </Heading>
            <Text>
              <Strong>Fonte de dados: </Strong>IBGE
            </Text>
          </Flex>
          <Flex>
            <img
              style={{
                height: 33,
                width: 'auto',
              }}
              src="/georedus/assets/parcerias.png"
            />
          </Flex>
        </Flex>
      </>
    )
  }

  return (
    <>
      <Flex direction="column">
        <LayeredMap
          ref={layeredMapRef}
          sky={SKY_STYLE}
          maxPitch={80}
          mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.NEXT_PUBLIC_MAP_TILER_API_KEY}`}
          views={resolvedLayout?.[0]?.views}
          initialViewState={commitedViewState}
          onLoad={() => alert('map loaded')}
          style={{
            height: '615px',
            width: '1296px',
            marginTop: '0',
          }}
          canvasContextAttributes={{
            preserveDrawingBuffer: true,
          }}>
          
          <NavigationControl position="bottom-right" showZoom={false} />
          <ControlContainer
            position="bottom-left"
            style={{
              boxShadow: 'none',
              backgroundColor: '#ffffffd9',
              borderRadius: '10px',
            }}>
            <Flex width="150" p="2">
              <GeoReDUSLogo color="#384DA0" />
            </Flex>
          </ControlContainer>
          <ControlContainer
            position="bottom-left"
            style={{
              boxShadow: 'none',
              backgroundColor: '#ffffffd9',
              borderRadius: '10px',
            }}>
            <Flex p="2">
              <Text weight="bold">Projeção universal </Text>
              <Text style={{ marginTop: 0 }}>Mercator (EPSG:3857)</Text>
            </Flex>
          </ControlContainer>
          <ScaleControl position="bottom-right" />

          {/* <AttributionControl position="bottom-right" compact={false} /> */}
        </LayeredMap>
        <Flex
          direction="row"
          width="1296px"
          style={{ justifyContent: 'space-between' }}>
          <ImageDescription />
          <LegendContainer
            ref={legendMapRef}
            direction="row"
            flexGrow="1"
            gap="3"
            p={resolvedLayout.length > 1 ? '3' : '4'}>
            {legends
              .filter((legend) => legend?.type)
              .map((legend, i) => (
                <Legend key={legend.id || `${legend.type}-${i}`} {...legend} />
              ))}
          </LegendContainer>
          <Flex style={{ alignItems: 'end' }}>
            <QRCode value={href} />
          </Flex>
        </Flex>
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
            ctx.drawImage(
              legendImg,
              2480,
              70,
              928,
              928 * (legendImg.height / legendImg.width),
            )

            // Convert combined result to blob once
            combinedCanvas.toBlob((blob) => {
              setCombinedImage(URL.createObjectURL(blob))
            })

            setImageIsLoading(false)
          }}>
          Exportar Mapa
        </Button>
        {imageIsLoading && <Spinner />}
        {combinedImage && (
          <img style={{ maxWidth: '100%' }} src={combinedImage} />
        )}
      </Flex>
    </>
  )
}
