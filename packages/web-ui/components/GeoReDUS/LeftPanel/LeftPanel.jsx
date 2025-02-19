import { Flex, LoadingOverlay } from '@orioro/react-ui-core'
import { ViewMenu } from '../ViewMenu'
import { DevControls } from '../DevControls'
import { IconButton } from '@radix-ui/themes'
import Icon from '@mdi/react'
import { mdiArrowLeft } from '@mdi/js'
import { useEffect, useState } from 'react'

const OPEN_WIDTH = '350px'
const CLOSED_WIDTH = '60px'

const HEADER_HEIGHT = 50

export function LeftPanel({
  viewConfState,
  viewConfDispatch,
  viewSpecs,
  viewSpecSources,
  onSetViewSpecSources,
  open,
  onSetOpen,
}) {
  // const [mouseIsOver, setMouseIsOver] = useState(false)

  // useEffect(() => {
  //   let timeout
  //   if (mouseIsOver && !open) {
  //     timeout = setTimeout(() => onSetOpen(true), 300)
  //   }
  //   return () => clearTimeout(timeout)
  // }, [mouseIsOver, open])

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
          position: 'absolute',
          top: HEADER_HEIGHT / 2,
          left: 'calc(100%)',
          transform: 'translate(-50%, -50%)',
        }}
        size="1"
        type="button"
        onClick={() => onSetOpen(!open)}
        // variant="surface"
      >
        <Icon
          style={{
            transition: 'transform .2s ease-out',
            transform: `rotateZ(${open ? '0' : '180'}deg)`,
          }}
          path={mdiArrowLeft}
          size="16px"
        />
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
          p="10px"
          height={HEADER_HEIGHT}
          alignItems="center"
          direction="row"
          style={{
            backgroundColor: 'var(--accent-3)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            flexGrow: 0,
          }}
        >
          {open ? 'GeoReDUS' : null}
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
              <Flex
                direction="column"
                justifyContent="flex-end"
                alignItems="center"
                style={{
                  flexGrow: 1,
                  height: '100%',
                }}
                p="2"
              >
                {process.env.NODE_ENV !== 'production' && (
                  <DevControls
                    viewSpecSources={viewSpecSources}
                    onSetViewSpecSources={onSetViewSpecSources}
                  />
                )}
              </Flex>
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
          width="350px"
          style={{
            backgroundColor: 'white',
          }}
        >
          <img
            style={{
              transition: 'opacity .1s ease-out',
              opacity: open ? 1 : 0,
            }}
            src="/georedus/assets/parcerias.png"
          />
        </Flex>
      </Flex>
    </div>
  )
}
