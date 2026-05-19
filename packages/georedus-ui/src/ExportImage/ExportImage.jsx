import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { useLocation } from 'react-use'
import { Flex } from '@orioro/react-ui-core'
import { LayeredMap, ControlContainer } from '@orioro/react-maplibre-util'

import { Legend } from '@orioro/react-chart-util'
import QRCode from 'react-qr-code'

import styled from 'styled-components'
import { SKY_STYLE } from '../GeoReDUS/constants'
import { ScaleControl, AttributionControl } from 'react-map-gl/maplibre'

import { GeoReDUSLogo } from '../GeoReDUSLogo'
import { Heading, Text, Strong } from '@radix-ui/themes'

import { NorthArrow } from './NorthArrow'
import {
  LEGEND_CLASS_NAME,
  IMAGE_DESCRIPTION_CLASS_NAME,
  QR_CODE_CLASS_NAME,
  LOGO_CLASS_NAME,
  PROJECTION_CLASS_NAME,
  NORTH_ARROW_CLASS_NAME,
  SCALE_CONTROL_CLASS_NAME,
  extractMapImageBlobs,
} from './createMapBlob'

import { composeMapImageCanvas } from './createMapImage'

import { getPaperDimensions } from './paperDimensions'

import { useDialogs } from '../DialogSystem'

import { saveAs } from 'file-saver'

import { uniq } from 'lodash'

const LegendContainer = styled(Flex)`
  flex-wrap: wrap;
  background-color: white;
  border: none;
  box-shadow: none;
`

// Paper dimensions for preview (PAPER_WIDTH = 3508 for final image export)
const {
  MARGIN,
  PIXELRATIO,
  INSIDE_WIDTH,
  MAP_WIDTH,
  MAP_HEIGHT,
  BOTTOM_HEIGHT,
  DESCRIPTION_WIDTH,
} = getPaperDimensions(1200)

export const ExportImage = forwardRef(function ExportImage(
  {
    resolvedLayout,
    commitedViewState,
    municipioId,
    METADATA_API_ENDPOINT,
    baseMapStyle,
    topViews,
  },
  ref,
) {
  ExportImage.displayName = 'ExportImage'

  const dialogs = useDialogs()
  const rootRef = useRef(null)
  const layeredMapRef = useRef(null)

  const legends = resolvedLayout?.[0]?.legends || []

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
    uniq(
      resolvedLayout?.[0]?.views
        ?.map((view) => view.metadata.sourceLabel || '')
        .filter(Boolean) || [],
    ).join(' + ') || ''

  async function createImg() {
    const extractedBlobs = await extractMapImageBlobs({
      map: layeredMapRef.current.map,
      rootEl: rootRef.current,
    })

    const imageCanva = await dialogs.loading(async () => {
      return composeMapImageCanvas(extractedBlobs)
    })
    saveAs(imageCanva, 'georedus_map.png') //montar nome dinamicamente
  }

  useImperativeHandle(
    ref,
    () => ({
      createImg,
    }),
    [dialogs],
  )

  function ImageDescription() {
    return (
      <>
        <Flex
          direction="column"
          width={`${DESCRIPTION_WIDTH}px`}
          className={IMAGE_DESCRIPTION_CLASS_NAME}>
          <Flex height="100%" wrap="wrap" gap="2">
            <Heading size="4" color="iris">
              {munName} - {ufSigla} / BR
            </Heading>
            <Heading size="2" color="iris">
              {new Date()
                .toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })
                .replace(/\//g, '.')}
            </Heading>
            <Text size="2">
              <Strong>Fonte de dados: </Strong>
              {sourceLabels || ''}
            </Text>
            <Text size="2">
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
    <Flex direction="column" ref={rootRef}>
      <LayeredMap
        ref={layeredMapRef}
        sky={SKY_STYLE}
        maxPitch={80}
        pixelRatio={PIXELRATIO}
        attributionControl={false}
        mapStyle={baseMapStyle}
        views={[
          ...(resolvedLayout?.[0]?.views || []).reverse(),
          ...(topViews || []),
        ]}
        initialViewState={commitedViewState}
        style={{
          height: `${MAP_HEIGHT}px`,
          width: `${MAP_WIDTH}px`,
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
          <Flex width="150" p="2" className={LOGO_CLASS_NAME}>
            <GeoReDUSLogo color="#384DA0" />
          </Flex>
        </ControlContainer>
        <AttributionControl position="bottom-right" compact={false} />
        <ControlContainer //tirar north arrow dentro do container
          position="bottom-left"
          style={{
            boxShadow: 'none',
            backgroundColor: 'transparent',
            borderRadius: '10px',
          }}>
          <Flex p="2" className={PROJECTION_CLASS_NAME} width="fit-content">
            <Text weight="bold">Projeção universal </Text>
            <Text style={{ marginTop: 0 }}>Mercator (EPSG:3857)</Text>
          </Flex>
        </ControlContainer>
        <NorthArrow
          position="bottom-left"
          animationDuration={300}
          className={NORTH_ARROW_CLASS_NAME}
        />
        <ScaleControl
          position="bottom-left"
          className={SCALE_CONTROL_CLASS_NAME}
        />
      </LayeredMap>

      <Flex></Flex>
      <Flex
        direction="row"
        width={`${INSIDE_WIDTH}px`}
        height={`${BOTTOM_HEIGHT}px`}
        style={{
          justifyContent: 'space-between',
          marginTop: `${MARGIN}px !important`,
        }}>
        <ImageDescription />
        <LegendContainer
          className={LEGEND_CLASS_NAME}
          direction="column"
          gap="3"
          p="0"
          style={{ margin: '0 !important' }}>
          {legends
            .filter((legend) => legend?.type)
            .map((legend, i) => (
              <Legend
                key={legend.id || `${legend.type}-${i}`}
                {...legend}
                style={{
                  marginTop: '0 !important',
                  marginBottom: '10px',
                  fontSize: '8px !important',
                }}
              />
            ))}
        </LegendContainer>
        <Flex style={{ alignItems: 'end' }}>
          <QRCode value={href} className={QR_CODE_CLASS_NAME} />
        </Flex>
      </Flex>
    </Flex>
  )
})
