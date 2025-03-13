import { Flex, LoadingIndicator, withDefaults } from '@orioro/react-ui-core'
import { makeDirNav } from '@orioro/react-dir-nav'
import { Icon } from '@mdi/react'
import {
  mdiAccountGroup,
  mdiSchool,
  mdiHomeCity,
  mdiBottleTonicPlusOutline,
} from '@mdi/js'
import { ViewControl } from '../ViewControl'
import styled from 'styled-components'
import { createContext, useContext } from 'react'
import { VIEW_TYPE_SURFACE_CHOROPLETH } from '../viewSpecs/constants'

const STATIC_NODE_ICONS = {
  'populacao-e-domicilios': <Icon path={mdiAccountGroup} />,
  educacao: <Icon path={mdiSchool} />,
  'infraestrutura-e-servicos-urbanos': <Icon path={mdiHomeCity} />,
  saude: <Icon path={mdiBottleTonicPlusOutline} />,
}

function errNoViewMenuContext() {
  throw new Error('No ViewMenuContext found')
}

const ViewMenuContext = createContext({
  viewConfState: {},
  onSetView: errNoViewMenuContext,
  onDeactivateView: errNoViewMenuContext,
})

function Item({ node, depth }) {
  const { viewSpecs, viewConfState, onSetView, onDeactivateView } =
    useContext(ViewMenuContext)

  const viewSpecsById = Object.fromEntries(
    viewSpecs.map((spec) => [spec.id, spec]),
  )

  return (
    <ViewControl
      viewSpec={node}
      viewConf={viewConfState.byId[node.id]}
      viewConfState={viewConfState}
      onDeactivateView={() => onDeactivateView(node.id)}
      onSetView={(viewConf, layoutIndex) => {
        // console.log('onSetView', vi, layoutIndex)

        //
        // If the layoutIndex is undefined
        // and the viewConf still has not been allocated
        // to any layout slot, attempt to find an appropriate
        // initial layout slot
        //
        if (
          typeof layoutIndex === 'undefined' &&
          !viewConfState.layout.some((list) =>
            list.items.some((item) => item.id === node.id),
          )
        ) {
          layoutIndex =
            viewSpecsById[node.id]?.viewType === VIEW_TYPE_SURFACE_CHOROPLETH
              ? //
                // If the new view is a surface_choropleth,
                // find a map inside layout that still has no surface_choropleths
                //
                viewConfState.layout.findIndex((list) =>
                  list.items.every(
                    (item) =>
                      viewSpecsById[item.id].viewType !==
                      VIEW_TYPE_SURFACE_CHOROPLETH,
                  ),
                )
              : 0
        }

        console.log('will set layoutIndex', layoutIndex)

        layoutIndex = layoutIndex === -1 ? 0 : layoutIndex

        onSetView(
          {
            ...viewConf,
            id: node.id,
          },
          layoutIndex,
        )
      }}
    />
  )
}

const ItemContainer = styled(
  withDefaults(Flex, {
    direction: 'column',
    gap: '3',
    p: '3',
  }),
)`
  background-color: var(--accent-3);
`

const DirNav = makeDirNav({
  components: {
    Item,
    ItemContainer,
  },
})

export function ViewMenu({
  viewSpecs,
  viewConfState,
  onSetView,
  onDeactivateView,
  style,
  ...props
}) {
  return (
    <div style={style}>
      <ViewMenuContext.Provider
        value={{
          viewSpecs,
          viewConfState,
          onSetView,
          onDeactivateView,
        }}
      >
        <DirNav
          style={{
            flexGrow: 1,
            overflow: 'hidden',
          }}
          items={viewSpecs}
          onSelectItem={(item) => {
            setSelected(item)
          }}
          getNodeIcon={(node) => STATIC_NODE_ICONS[node.id]}
          {...props}
        />
      </ViewMenuContext.Provider>
    </div>
  )
}
