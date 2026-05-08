import { useEffect, useRef, useState } from 'react'
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

import { NorthArrow } from './NorthArrow'

export function ExportImage({
  resolvedLayout,
  commitedViewState,
  municipioId,
  METADATA_API_ENDPOINT,
}) {
  const layeredMapRef = useRef(null)

  const legends = resolvedLayout?.[0]?.legends || []

  const LegendContainer = styled(Flex)`
    flex-wrap: wrap;
    background-color: white;
    border: none;
    box-shadow: none;
  `

  const legendMapRef = useRef(null)
  const descriptionRef = useRef(null)
  const qrCodeRef = useRef(null)

  const [imageIsLoading, setImageIsLoading] = useState(false)
  const [combinedImage, setCombinedImage] = useState(null)

  const { href } = useLocation()

  //Retrieve municipality data
  const [munName, setMunName] = useState(null)
  const [ufSigla, setUfSigla] = useState(null)

  useEffect(() => {
    const fetchMunicipalityData = async () => {
      const [mun] = await fetch(
        `${METADATA_API_ENDPOINT}/ibge_malha_br_municipio?select=nome,id,uf_sigla&id=eq.${municipioId}`,
      ).then((res) => res.json())

      setMunName(mun.nome)
      setUfSigla(mun.uf_sigla)
    }

    fetchMunicipalityData()
  }, [municipioId, METADATA_API_ENDPOINT])

  const sourceLabels =
    Array.from(
      new Set(
        resolvedLayout?.[0]?.views
          ?.map((view) => view.metadata.sourceLabel || '')
          .filter(Boolean) || [],
      ),
    ).join(' + ') || ''

  function ImageDescription() {
    return (
      <>
        <Flex direction="column" width="25%" ref={descriptionRef}>
          <Flex height="100%" wrap="wrap" gap="2">
            <Heading size="6" color="iris">
              {munName} - {ufSigla} / BR
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
              <Strong>Fonte de dados: </Strong>
              {sourceLabels || ''}
            </Text>
            <Text>
              <Strong>Outros dados: </Strong>© MapTiler | © OpenStreetMap
              contributors
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
          attributionControl={false}
          mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.NEXT_PUBLIC_MAP_TILER_API_KEY}`}
          views={resolvedLayout?.[0]?.views}
          initialViewState={commitedViewState}
          style={{
            height: '615px',
            width: '1296px',
            marginTop: '0',
          }}
          canvasContextAttributes={{
            preserveDrawingBuffer: true,
          }}>
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
          <AttributionControl position="bottom-right" compact={false} />
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
            <NorthArrow position="bottom-right" animationDuration={300} />
          </ControlContainer>
          <ScaleControl position="bottom-right" />
        </LayeredMap>
        <Flex
          direction="row"
          width="1296px"
          height="300px"
          style={{ justifyContent: 'space-between' }}>
          {/* <div ref={descriptionRef}> */}
          <ImageDescription />
          {/* </div> */}
          <LegendContainer
            ref={legendMapRef}
            direction="column"
            flexGrow="1"
            gap="3"
            p={resolvedLayout.length > 1 ? '3' : '4'}>
            {legends
              .filter((legend) => legend?.type)
              .map((legend, i) => (
                <Legend
                  key={legend.id || `${legend.type}-${i}`}
                  {...legend}
                  style={{
                    marginTop: '0 !important',
                    marginBottom: '10px',
                  }}
                />
              ))}
          </LegendContainer>
          <Flex style={{ alignItems: 'end' }}>
            <QRCode ref={qrCodeRef} value={href} />
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
              backgroundColor: '#ffffff',
            })

            const blobDescription = await toBlob(descriptionRef.current, {
              cacheBust: true,
              pixelRatio: 2,
              fontEmbedCSS: false,
              backgroundColor: '#ffffff',
            })

            const blobQRCode = await toBlob(qrCodeRef.current, {
              cacheBust: true,
              pixelRatio: 2,
              fontEmbedCSS: false,
              backgroundColor: '#ffffff',
            })

            // Convert legend blob to image (only time we need to convert)
            const legendImg = await new Promise((resolve) => {
              const img = new Image()
              img.onload = () => resolve(img)
              img.src = URL.createObjectURL(blobLegend)
            })

            const descriptionImg = await new Promise((resolve) => {
              const img = new Image()
              img.onload = () => resolve(img)
              img.src = URL.createObjectURL(blobDescription)
            })

            const qrCodeImg = await new Promise((resolve) => {
              const img = new Image()
              img.onload = () => resolve(img)
              img.src = URL.createObjectURL(blobQRCode)
            })

            // Create combined canvas and draw directly
            const combinedCanvas = document.createElement('canvas')

            // Define margins (in pixels)
            const margin = 100

            // Set internal resolution with margins
            combinedCanvas.width = 3508
            combinedCanvas.height = 2480

            const ctx = combinedCanvas.getContext('2d')

            // Fill background white
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height)

            // Scale map to new canvas size maintaining aspect ratio
            // Map is 1296x615, canvas is 3508x2480
            const mapScaleX = (3508 - margin * 2) / 1296
            const mapHeight = 615 * mapScaleX // ~1664px
            ctx.drawImage(
              mapCanvas,
              margin,
              margin,
              3508 - margin * 2,
              mapHeight,
            )

            // Position legend in bottom section
            const bottomStartY = mapHeight + margin * 2
            const bottomHeight = 2480 - margin * 3 - mapHeight // ~816px
            const descriptionWidth =
              bottomHeight * (descriptionImg.width / descriptionImg.height) // 20% of canvas width
            const legendWidth =
              bottomHeight * (legendImg.width / legendImg.height)

            // Draw description on bottom left

            ctx.drawImage(
              descriptionImg,
              margin,
              bottomStartY,
              descriptionWidth,
              bottomHeight,
            )

            ctx.drawImage(
              legendImg,
              margin + descriptionWidth,
              bottomStartY,
              legendWidth,
              bottomHeight,
            )

            // Draw QRCode on bottom right
            const qrCodeSize = bottomHeight
            ctx.drawImage(
              qrCodeImg,
              combinedCanvas.width - margin - qrCodeSize,
              bottomStartY,
              qrCodeSize,
              qrCodeSize,
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
