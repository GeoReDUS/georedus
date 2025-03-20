import { Flex, LoadingOverlay } from '@orioro/react-ui-core'
import { ViewMenu } from '../ViewMenu'
import { IconButton, Tooltip } from '@radix-ui/themes'
import Icon from '@mdi/react'
import { mdiChevronLeft } from '@mdi/js'
import { GeoReDUSLogoSymbol, GeoReDUSLogoText } from '../GeoReDUSLogo'
import styled from 'styled-components'

const OPEN_WIDTH = '380px'
const CLOSED_WIDTH = '60px'

const HEADER_HEIGHT = 60

const LogoContainer = styled(Flex)`
  height: 100%;

  svg {
    height: 100%;
    width: auto;
  }
`

export function LeftPanel({
  viewConfState,
  viewConfDispatch,
  viewSpecs,
  viewSpecSources,
  onSetViewSpecSources,
  open,
  onSetOpen,
}) {
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
      <IconButton
        style={{
          border: '1px solid white',
          position: 'absolute',
          top: HEADER_HEIGHT * (2 / 3),
          left: 'calc(100%)',
          transform: 'translate(-50%, -50%)',
          boxShadow:
            'rgba(0, 0, 0, 0.1) 0px 4px 6px -1px,' +
            'rgba(0, 0, 0, 0.06) 0px 2px 4px -1px',

          height: 20,
          width: 20,
        }}
        size="1"
        type="button"
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
        onClick={(e) => onSetOpen(true)}
      >
        <Flex
          px="12px"
          py="10px"
          height={HEADER_HEIGHT}
          alignItems="center"
          direction="row"
          style={{
            backgroundColor: 'var(--accent-9)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            flexGrow: 0,
          }}
        >
          <LogoContainer direction="row" gap="8px">
            <GeoReDUSLogoSymbol />

            <div
              style={{
                transition: open
                  ? 'opacity .7s ease-out'
                  : 'opacity .1s ease-out',
                opacity: open ? 1 : 0,
              }}
            >
              <GeoReDUSLogoText />
            </div>
          </LogoContainer>

          {/*{open ? (
            <LogoContainer>
              <GeoReDUSLogo />
            </LogoContainer>
          ) : (
            <LogoContainer>
              <GeoReDUSLogoSymbol />
            </LogoContainer>
          )}*/}
        </Flex>
        {Array.isArray(viewSpecs) ? (
          <ViewMenu
            style={{
              flexGrow: 1,
              height: '1px',
            }}
            viewSpecs={viewSpecs}
            viewConfState={viewConfState}
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
              null
              // <Flex
              //   direction="column"
              //   justifyContent="flex-end"
              //   alignItems="center"
              //   style={{
              //     flexGrow: 1,
              //     height: '100%',
              //   }}
              //   p="2"
              // >
              //   {process.env.NODE_ENV !== 'production' && (
              //     <DevControls
              //       viewSpecSources={viewSpecSources}
              //       onSetViewSpecSources={onSetViewSpecSources}
              //     />
              //   )}
              // </Flex>
            }
          />
        ) : (
          <div
            style={{
              flexGrow: 1,
              position: 'relative',
            }}
          >
            <LoadingOverlay />
          </div>
        )}
        <Flex
          p="0"
          style={{
            backgroundColor: 'white',
          }}
          direction="row"
          justifyContent="center"
        >
          <img
            style={{
              transition: 'opacity .1s ease-out',
              opacity: open ? 1 : 0,
              height: 70,
              width: 'auto',
            }}
            src="/georedus/assets/parcerias.png"
          />
        </Flex>
      </Flex>
    </div>
  )
}
