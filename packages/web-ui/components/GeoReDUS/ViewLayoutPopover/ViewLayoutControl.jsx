import { makeSortableMultiList } from '@orioro/react-sortable'
import { ViewControl } from '../ViewControl'
import { createContext, useContext } from 'react'
import { Box, Flex } from '@orioro/react-ui-core'
import Icon from '@mdi/react'
import { mdiDragVertical } from '@mdi/js'
import { Text } from '@radix-ui/themes'

const ViewLayoutControlContext = createContext(null)

const ViewLayoutSortable = makeSortableMultiList({
  components: {
    Item: function Item({ dragHandleProps, item, isDragging, isDragOverlay }) {
      if (isDragOverlay) {
        return <div>Dragoverlay</div>
      }

      const { viewSpecs, viewConfState, viewConfDispatch } = useContext(
        ViewLayoutControlContext,
      )

      return (
        <Flex
          direction="row"
          alignItems="center"
          gap="0"
          style={{
            // TODO: review drag overlay issue
            // opacity: isDragging && !isDragOverlay ? 0.5 : 1,
            transform: isDragOverlay ? 'scale(1.05)' : '',
            boxShadow: isDragOverlay
              ? 'rgba(0, 0, 0, 0.35) 0px 5px 15px;'
              : 'none',
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
              borderTopLeftRadius: 10,
              borderBottomLeftRadius: 10,
              height: 65,
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
    List: function List({ children, item }) {
      return (
        <div
          style={{
            width: 280,
          }}
        >
          {item.items.length > 0 ? (
            children
          ) : (
            <Flex
              p="4"
              style={{
                border: 'dashed 1px var(--accent-6)',
                textAlign: 'center',
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
