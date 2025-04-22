import React from 'react'

import { makeSortableMultiList } from '@orioro/react-sortable'
import { ViewControl } from '../ViewControl'
import { createContext, useContext } from 'react'
import { Box, Flex } from '@orioro/react-ui-core'
import Icon from '@mdi/react'
import { mdiDragVertical } from '@mdi/js'
import { Text } from '@radix-ui/themes'
import { Portal, Theme } from '@radix-ui/themes'

const ViewLayoutControlContext = createContext(null)

const DRAG_HANDLE_BORDER_RADIUS = 10
const CONTROL_HEIGHT = 85

const ViewLayoutSortable = makeSortableMultiList({
  components: {
    //
    // Wrap portalled elements inside theme
    //
    Portal: function ({ children }) {
      return (
        <Portal>
          <Theme>{children}</Theme>
        </Portal>
      )
    },

    Item: function Item({ dragHandleProps, item, isDragging, isDragOverlay }) {
      const { viewSpecs, viewConfState, viewConfDispatch } = useContext(
        ViewLayoutControlContext,
      )

      // const boxShadow = isDragOverlay
      //   ? 'rgba(0, 0, 0, 0.35) 0px 5px 15px;'
      //   : 'none'

      return (
        <Flex
          direction="row"
          alignItems="center"
          gap="0"
          style={{
            // TODO: review drag overlay issue
            opacity: isDragging && !isDragOverlay ? 0.5 : 1,
            transform: isDragOverlay ? 'scale(1.05)' : '',
            zIndex: isDragOverlay ? 999 : 0,
          }}
        >
          <div
            {...dragHandleProps}
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
              background: 'white',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              borderTopLeftRadius: DRAG_HANDLE_BORDER_RADIUS,
              borderBottomLeftRadius: DRAG_HANDLE_BORDER_RADIUS,
              height: CONTROL_HEIGHT,
            }}
          >
            <Icon path={mdiDragVertical} size="24px" />
          </div>

          <Flex
            direction="column"
            style={{
              flexGrow: 1,
            }}
          >
            <ViewControl
              style={{
                height: CONTROL_HEIGHT,
              }}
              path
              viewSpec={viewSpecs.find((spec) => spec.id === item.id)}
              viewConf={viewConfState.byId[item.id]}
              viewConfState={viewConfState}
              configurable={false}
              onActivateView={(initialConf) =>
                viewConfDispatch({
                  type: 'ADD_ENTRY',
                  payload: {
                    ...initialConf,
                    id: item.id,
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
              onDeactivateView={() => {
                viewConfDispatch({
                  type: 'DEACTIVATE_VIEW',
                  payload: item.id,
                })
              }}

              // onDeactivateView={() => onDeactivateView(item.id)}
              // onSetView={(initialConf, layoutIndex) =>
              //   onSetView(
              //     {
              //       ...initialConf,
              //       id: node.id,
              //     },
              //     layoutIndex,
              //   )
              // }
            />
          </Flex>
        </Flex>
      )
    },
    List: function List({ children, dragHandleProps, item }) {
      return (
        <Flex
          direction="column"
          width="280px"
          // pb="30px"
          style={{
            border: 'dashed 1px var(--accent-6)',
            borderRadius: `${DRAG_HANDLE_BORDER_RADIUS}px`,
          }}
        >
          <div
            style={{
              margin: '-1px -1px -1px -1px',
            }}
          >
            {children}

            {item.items.length === 0 && (
              <Flex
                p="4"
                style={{
                  // border: 'dashed 1px var(--accent-6)',
                  textAlign: 'center',
                  height: `${CONTROL_HEIGHT}px`,
                }}
                justifyContent="center"
                alignItems="center"
              >
                <Text size="2">
                  Arraste uma camada para visualizar em mapa comparado
                </Text>
              </Flex>
            )}
          </div>
        </Flex>
      )
    },
  },
})

export function ViewLayoutControl({
  viewSpecs,
  viewConfState,
  viewConfDispatch,
}) {
  console.log('ViewLayoutControl', viewConfState.layout)

  return (
    <ViewLayoutControlContext.Provider
      value={{
        viewSpecs,
        viewConfState,
        viewConfDispatch,
      }}
    >
      <ViewLayoutSortable
        lists={viewConfState.layout}
        onSetLists={(nextLayout) =>
          viewConfDispatch({
            type: 'SET_LAYOUT',
            payload: nextLayout,
          })
        }
      />
    </ViewLayoutControlContext.Provider>
  )
}
