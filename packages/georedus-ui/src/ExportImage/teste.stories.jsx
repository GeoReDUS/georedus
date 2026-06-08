import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from 'react'
import { useLocation } from 'react-use'
import { Flex } from '@orioro/react-ui-core'
import { LayeredMap, ControlContainer } from '@orioro/react-maplibre-util'
import { Legend } from '@orioro/react-chart-util'
import { QRCode } from 'react-qr-code'
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
import { slugify } from '@orioro/util'
import { useSearchParams, BrowserRouter } from 'react-router-dom'

// const LegendContainer = styled(Flex)`
//   flex-wrap: wrap;
//   background-color: white;
//   border: none;
//   box-shadow: none;
// `

import { PAPER_WIDTH_PX, PREVIEW_WIDTH_PX } from './constants.js'
const {
  PAPER_WIDTH,
  PAPER_HEIGHT,
  PIXELRATIO,
} = getPaperDimensions(PREVIEW_WIDTH_PX)


export default {
  title: 'GeoReDUS / ExportImage',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
}

export const Basic = ({
  resolvedLayout,
  commitedViewState,
  municipioId,
  baseMapStyle,
  topViews,
}) => {
  const rootRef = useRef(null)
  const layeredMapRef = useRef(null)
  const { href } = useLocation()

  const createImg = useCallback(async () => {
    const extractedBlobs = await extractMapImageBlobs({
      map: layeredMapRef.current.map,
      rootEl: rootRef.current,
    })
    return composeMapImageCanvas(extractedBlobs)
    saveAs(imageCanva, `${municipioId}.png`)
  }, [layeredMapRef.current?.map, rootRef.current])

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
          height: `${PAPER_HEIGHT}px`,
          width: `${PAPER_WIDTH}px`,
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
    </Flex>
  )
}
