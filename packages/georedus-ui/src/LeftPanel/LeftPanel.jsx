import React, { memo } from 'react'

import { Flex, LoadingOverlay } from '@orioro/react-ui-core'
import { ViewMenu } from '../ViewMenu'
import { IconButton, Tooltip } from '@radix-ui/themes'
import { Icon } from '@mdi/react'
import {
  mdiChevronLeft,
  mdiForumOutline,
  mdiShareVariantOutline,
  mdiMapMarker,
} from '@mdi/js'
import { GeoReDUSLogoSymbol, GeoReDUSLogoText } from '../GeoReDUSLogo'
import { useDialogs } from '../DialogSystem'
import styled from 'styled-components'
import { SharePanel } from './SharePanel'
import { GeocodeCSVUploader } from '../GeocodeCSVUploader'

const OPEN_WIDTH = { xs: 'calc(100vw - 30px)', sm: '380px' }
const CLOSED_WIDTH = '60px'

const HEADER_HEIGHT = 60

const LogoContainer = styled(Flex)`
  height: 100%;

  svg {
    height: 100%;
    width: auto;
  }
`

function LeftPanelInner({
  viewConfState,
  viewConfDispatch,
  viewSpecs,
  resolvedViews,
  resolvedLayout,
  open,
  onSetOpen,

  // props required for export image, but not used here
  commitedViewState,
  municipioId,
  METADATA_API_ENDPOINT,
  baseMapStyle,
  topViews,

  categoryIcons = undefined,
  header: customHeader = undefined,
  footer: customFooter = undefined,
}) {
  const dialogs = useDialogs()

  const header =
    typeof customHeader !== 'undefined' ? (
      customHeader
    ) : (
      <Flex
        px="12px"
        py="10px"
        height={HEADER_HEIGHT}
        alignItems="center"
        justifyContent="space-between"
        direction="row"
        style={{
          backgroundColor: 'var(--accent-9)',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          flexGrow: 0,
        }}>
        <LogoContainer direction="row" gap="8px">
          <GeoReDUSLogoSymbol />

          <div
            style={{
              transition: open
                ? 'opacity .7s ease-out'
                : 'opacity .1s ease-out',
              opacity: open ? 1 : 0,
            }}>
            <GeoReDUSLogoText />
          </div>
        </LogoContainer>
        <div>
          <IconButton
            variant="soft"
            size="3"
            asChild
            style={{ color: 'white' }}>
            <a
              href="https://www.redus.org.br/georedus-rede-de-dados-urbanos/formularios/cbf766bb-9a74-4bc5-897a-70b9151afbdb"
              target="_blank"
              rel="noreferrer nofollow">
              <Tooltip content="Dúvidas e sugestões">
                <Icon path={mdiForumOutline} size="24px" />
              </Tooltip>
            </a>
          </IconButton>
          <IconButton
            variant="soft"
            size="3"
            style={{ color: 'white' }}
            onClick={async () => {
              await dialogs.view({
                maxWidth: '1500px',
                width: '1200px',
                children: (
                  <SharePanel
                    resolvedLayout={resolvedLayout}
                    commitedViewState={commitedViewState}
                    municipioId={municipioId}
                    METADATA_API_ENDPOINT={METADATA_API_ENDPOINT}
                    baseMapStyle={baseMapStyle}
                    topViews={topViews}
                  />
                ),
              })
            }}>
            <Tooltip content="Compartilhar">
              <Icon path={mdiShareVariantOutline} size="24px" />
            </Tooltip>
          </IconButton>
          <IconButton
                  variant="soft"
                  size="3"
                  style={{ color: 'white' }}
                  onClick={async () => {
                    await dialogs.view(
                      <GeocodeCSVUploader
                        syncedMapsRef={syncedMapsRef}
                        geocodeApiEndpoint={
                          process.env.NEXT_PUBLIC_GEOCODE_API_ENDPOINT
                        }
                      />,
                    )
                  }}
                >
                  <Tooltip content="Geocodificar CSV">
                    <Icon path={mdiMapMarker} size="24px" />
                  </Tooltip>
          </IconButton>
        </div>
      </Flex>
    )

  const footer =
    typeof customFooter !== 'undefined' ? (
      customFooter
    ) : (
      <Flex
        p="2"
        style={{
          backgroundColor: 'white',
        }}
        direction="row"
        justifyContent="center">
        <img
          style={{
            transition: 'opacity .1s ease-out',
            opacity: open ? 1 : 0,
            height: 48,
            width: 'auto',

            // height: 'auto',
            // width: '100%',
          }}
          src="/georedus/assets/parcerias.png"
        />
      </Flex>
    )

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 2,
        top: 0,
        left: 0,
        bottom: 0,
      }}
      // onMouseEnter={() => setMouseIsOver(true)}
      // onMouseLeave={() => setMouseIsOver(false)}
    >
      <Flex
        //
        // Use flex for responsive positioning
        //
        style={{
          position: 'absolute',
          zIndex: 1000,
          top: {
            xs: `${1.2 * HEADER_HEIGHT}px`,
            md: `${HEADER_HEIGHT * (2 / 3)}px`,
          },
          left: 'calc(100%)',
          transform: 'translate(-50%, -50%)',

          height: { xs: '40px', md: '20px' },
          width: { xs: '40px', md: '20px' },
        }}>
        <IconButton
          size={{
            xs: '3',
            md: '1',
          }}
          type="button"
          style={{
            border: '1px solid white',
            height: '100%',
            width: '100%',
            boxShadow:
              'rgba(0, 0, 0, 0.1) 0px 4px 6px -1px,' +
              'rgba(0, 0, 0, 0.06) 0px 2px 4px -1px',
          }}
          onClick={() => onSetOpen(!open)}
          // variant="surface"
        >
          <Tooltip content={open ? 'Fechar painel' : 'Abrir painel'}>
            <Icon
              style={{
                transition: 'transform .2s ease-out',
                transform: `rotateZ(${open ? '0' : '180'}deg)`,
              }}
              path={mdiChevronLeft}
              size="16px"
            />
          </Tooltip>
        </IconButton>
      </Flex>
      <Flex
        direction="column"
        gap="0"
        height="100vh"
        width={open ? OPEN_WIDTH : CLOSED_WIDTH}
        style={{
          transition: 'width .1s ease-out',
          overflow: 'hidden',
          boxShadow:
            'rgba(0, 0, 0, 0.1) 0px 4px 6px -1px,' +
            'rgba(0, 0, 0, 0.06) 0px 2px 4px -1px',
        }}
        onClick={(e) => onSetOpen(true)}>
        {header}
        {Array.isArray(viewSpecs) ? (
          <ViewMenu
            style={{
              flexGrow: 1,
              height: '1px',
            }}
            categoryIcons={categoryIcons}
            viewSpecs={viewSpecs}
            viewConfState={viewConfState}
            resolvedViews={resolvedViews}
            onActivateView={(viewId, initialConf) =>
              viewConfDispatch({
                type: 'ADD_ENTRY',
                payload: {
                  ...initialConf,
                  id: viewId,
                },
              })
            }
            onSetView={(viewConf, layoutIndex) => {
              viewConfDispatch({
                type: 'SET_VIEW',
                payload: {
                  viewConf,
                  layoutIndex,
                },
              })
            }}
            onDeactivateView={(viewId) => {
              viewConfDispatch({
                type: 'DEACTIVATE_VIEW',
                payload: viewId,
              })
            }}
            sideBarBottom={
              <Flex
                style={{
                  flexGrow: 1,
                }}
                pb="3"
                direction="column"
                gap="3"
                justifyContent="flex-end"
                alignItems="center">
              </Flex>
            }
          />
        ) : (
          <div
            style={{
              flexGrow: 1,
              position: 'relative',
            }}>
            <LoadingOverlay message={null} />
          </div>
        )}
        {footer}
      </Flex>
    </div>
  )
}

export const LeftPanel = memo(LeftPanelInner)
