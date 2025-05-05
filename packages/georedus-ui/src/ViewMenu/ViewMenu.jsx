import React from 'react'

import { Flex, TextEllipsis, withDefaults } from '@orioro/react-ui-core'

import { nodeIdFromPath } from '@orioro/tree-model'

import { makeDirNav } from '@orioro/react-dir-nav'
import { Icon } from '@mdi/react'
import {
  mdiAccountGroup,
  mdiSchool,
  mdiHomeCity,
  mdiHospitalBox,
} from '@mdi/js'
import { ViewControl } from '../ViewControl'
import styled from 'styled-components'
import { createContext, useContext, useMemo } from 'react'
import { VIEW_TYPE_SURFACE_CHOROPLETH } from '../viewSpecs/constants'

const STATIC_NODE_ICONS = {
  'populacao-e-domicilios': <Icon path={mdiAccountGroup} />,
  educacao: <Icon path={mdiSchool} />,
  'infraestrutura-e-servicos-urbanos': <Icon path={mdiHomeCity} />,
  saude: <Icon path={mdiHospitalBox} />,
}

function errNoViewMenuContext() {
  throw new Error('No ViewMenuContext found')
}

const ViewMenuContext = createContext({
  viewConfState: {},
  onSetView: errNoViewMenuContext,
  onDeactivateView: errNoViewMenuContext,
})

const ActiveCounter = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  transform: translate(-30%, -30%);
  border-radius: 50%;
  border: 1px solid white;
  height: 20px;
  width: 20px;
  font-size: 12px;
  background-color: var(--accent-9);
  color: white;
  font-weight: bold;

  display: flex;
  align-items: center;
  justify-content: center;
`

function Item({ node, depth, textSearch }) {
  const {
    viewSpecsById,
    viewConfState,
    resolvedViews,
    onSetView,
    onDeactivateView,
  } = useContext(ViewMenuContext)

  return (
    <ViewControl
      textSearch={textSearch}
      path={Boolean(textSearch) ? node.path : null}
      viewSpec={node}
      viewConf={viewConfState.byId[node.id]}
      viewConfState={viewConfState}
      resolvedView={
        resolvedViews
          ? resolvedViews.find((view) => view.id === node.id) || null
          : null
      }
      onDeactivateView={() => onDeactivateView(node.id)}
      onSetView={(viewConf, layoutIndex) => {
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
                      viewSpecsById[item.id]?.viewType !==
                      VIEW_TYPE_SURFACE_CHOROPLETH,
                  ),
                )
              : 0
        }

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

function _countActiveViews({ viewConfState, viewSpecsById, nodeId }) {
  // Add final forward slash to ensure node id is understood as a dir
  const nodeDirPath = `${nodeId}/`

  return Object.keys(viewConfState.byId).filter((activeItemId) => {
    const viewSpec = viewSpecsById[activeItemId]

    if (!viewSpec) return false

    const activeItemPath = nodeIdFromPath(
      viewSpec.path + ' / ' + viewSpec.label,
    )

    return activeItemPath.startsWith(nodeDirPath)
  }).length
}

const DirNav = makeDirNav({
  components: {
    Item,
    ItemContainer,
    DirLabel: function DirLabel({ node }) {
      const { viewSpecsById, viewConfState } = useContext(ViewMenuContext)

      const activeViewsCount = _countActiveViews({
        viewConfState,
        viewSpecsById,
        nodeId: node.id,
      })

      return (
        <div
          style={{
            flexGrow: 1,
            textAlign: 'left',
            // whiteSpace: 'nowrap',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <TextEllipsis
            style={{
              flexShrink: 1,
            }}
          >
            {node.label}
          </TextEllipsis>
          {activeViewsCount > 0 && (
            <span
              style={{ marginLeft: 6, fontSize: '.8rem', fontWeight: 'bold' }}
            >
              ({activeViewsCount})
            </span>
          )}
        </div>
      )
    },
  },
})

export function ViewMenu({
  viewSpecs,
  viewConfState,
  resolvedViews,
  onSetView,
  onDeactivateView,
  style,
  ...props
}) {
  const viewSpecsById = useMemo(
    () => Object.fromEntries(viewSpecs.map((spec) => [spec.id, spec])),
    [viewSpecs],
  )

  return (
    <div style={style}>
      <ViewMenuContext.Provider
        value={{
          viewSpecsById,
          viewConfState,
          resolvedViews,
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
          getNodeIcon={(node) => {
            const activeViewsCount = _countActiveViews({
              viewConfState,
              viewSpecsById,
              nodeId: node.id,
            })

            return (
              <div
                style={{
                  position: 'relative',
                }}
              >
                {STATIC_NODE_ICONS[node.id]}
                {activeViewsCount > 0 && (
                  <ActiveCounter>{activeViewsCount}</ActiveCounter>
                )}
              </div>
            )
          }}
          {...props}
        />
      </ViewMenuContext.Provider>
    </div>
  )
}
