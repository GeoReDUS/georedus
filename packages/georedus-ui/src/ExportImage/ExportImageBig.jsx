import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from 'react'
import { useLocation } from 'react-use'
import { Flex, LoadingIndicator } from '@orioro/react-ui-core'
import {
  LayeredMap,
  ControlContainer,
  useTilesLoading,
} from '@orioro/react-maplibre-util'

import { Legend } from '@orioro/react-chart-util'
//
// Must import as named module:
// https://github.com/rosskhanas/react-qr-code/issues/285
//
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

import { composeMapImageCanvas } from './createMapImageBig'

import { getPaperDimensions } from './paperDimensions'

import { useDialogs } from '../DialogSystem'

import { saveAs } from 'file-saver'

import { uniq } from 'lodash'

import { slugify } from '@orioro/util'

import { fitGeometry } from '@orioro/react-maplibre-util'

import * as turf from '@turf/turf'
import 'maplibre-gl/dist/maplibre-gl.css'
const LegendContainer = styled(Flex)`
  box-shadow:
    rgba(0, 0, 0, 0.1) 0px 4px 6px -1px,
    rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;
  background-color: white;
  border-radius: 4px;
  padding: 8px;
  width: 260px;
`

import { PREVIEW_WIDTH_PX } from './constants.js'
const {
  INSIDE_WIDTH,
  INSIDE_HEIGHT,
  MARGIN,
  PIXELRATIO,
  MAP_WIDTH,
  MAP_HEIGHT,
  BOTTOM_HEIGHT,
  DESCRIPTION_WIDTH,
} = getPaperDimensions(PREVIEW_WIDTH_PX)

export const ExportImageBig = forwardRef(function ExportImageInner(
  {
    resolvedLayout,
    initialViewState,
    municipioId,
    METADATA_API_ENDPOINT,
    baseMapStyle,
    topViews,
    onlyMap = false,
    bbox,
  },
  ref,
) {
  const dialogs = useDialogs()
  const rootRef = useRef(null)
  const layeredMapRef = useRef(null)
  const [mapReady, setMapReady] = useState(false)

  const legends = resolvedLayout?.[0]?.legends || []

  const { href } = useLocation()

  const sourceLabels =
    uniq(
      resolvedLayout?.[0]?.views
        ?.map((view) => view.metadata.sourceLabel || '')
        .filter(Boolean) || [],
    ).join(' + ') || ''

  const createImg = useCallback(async () => {
    const extractedBlobs = await extractMapImageBlobs({
      map: layeredMapRef.current.map,
      rootEl: rootRef.current,
      onlyMap,
    })
    const imageCanva = await composeMapImageCanvas(extractedBlobs, onlyMap)

    saveAs(imageCanva, `${municipioId}.png`)
  }, [dialogs, layeredMapRef.current?.map, rootRef.current])

  useImperativeHandle(
    ref,
    () => ({
      createImg,
    }),
    [createImg],
  )

  const DEFAULT_INITIAL_VIEW_STATE = {
    longitude: -53.0736,
    latitude: -10.7798,
    zoom: 3.5,
  }

  const tilesLoading = useTilesLoading(
    [layeredMapRef.current?.map].filter(Boolean),
  )

  useEffect(() => {
    window.__tilesLoading = tilesLoading
    return () => {
      delete window.__tilesLoading
    }
  }, [tilesLoading])

  useEffect(() => {
    window.__createImg = async () => {
      await createImg()
    }
    return () => {
      delete window.__createImg
    }
  }, [createImg])

  return (
    <Flex direction="column" ref={rootRef}>
      {tilesLoading && (
        <LoadingIndicator
          style={{
            position: 'fixed',
            bottom: '40px',
            right: '20px',
            zIndex: 20,
          }}
        />
      )}
      <LayeredMap
        ref={layeredMapRef}
        sky={SKY_STYLE}
        maxPitch={80}
        pixelRatio={PIXELRATIO}
        attributionControl={false}
        mapStyle={baseMapStyle}
        onLoad={() => {
          setMapReady(true)
          if (bbox && bbox.geometry && layeredMapRef.current?.map) {
            const map = layeredMapRef.current.map
            const bounds = turf.bbox(bbox.geometry)
            map.fitBounds(bounds, {
              padding: {
                top: 60,
                bottom: 100,
                left: 60,
                right: 60,
              },
            })
          }
        }}
        views={
          mapReady
            ? [
                ...(resolvedLayout?.[0]?.views || []).reverse(),
                ...(topViews || []),
              ]
            : []
        }
        initialViewState={initialViewState}
        style={{
          height: `${onlyMap ? INSIDE_HEIGHT : MAP_HEIGHT}px`,
          width: `${onlyMap ? INSIDE_WIDTH : MAP_WIDTH}px`,
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
        <ControlContainer
          position="bottom-right"
          style={{
            width: 'auto',
            height: 'auto',
          }}>
          <LegendContainer
            className={LEGEND_CLASS_NAME}
            direction="column"
            gap="3">
            {legends
              .filter((legend) => legend?.type)
              .map((legend, i) => (
                <Legend key={legend.id || `${legend.type}-${i}`} {...legend} />
              ))}
          </LegendContainer>
        </ControlContainer>
      </LayeredMap>
    </Flex>
  )
})
