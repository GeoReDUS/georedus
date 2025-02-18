import { Flex, LoadingIndicator, withDefaults } from '@orioro/react-ui-core'
import { makeDirNav } from '@orioro/react-dir-nav'
import { Icon } from '@mdi/react'
import { mdiAccountGroup, mdiSchool, mdiTrainCar } from '@mdi/js'
import { ViewControl } from '../ViewControl'
import styled from 'styled-components'
import { createContext, useContext } from 'react'

const STATIC_NODE_ICONS = {
  'populacao-e-domicilios': <Icon path={mdiAccountGroup} />,
  educacao: <Icon path={mdiSchool} />,
  'infraestrutura-e-servicos-urbanos': <Icon path={mdiTrainCar} />,
}

function errNoViewMenuContext() {
  throw new Error('No ViewMenuContext found')
}

const ViewMenuContext = createContext({
  viewConfById: {},
  onActivateView: errNoViewMenuContext,
  onDeactivateView: errNoViewMenuContext,
  onUpdateViewConf: errNoViewMenuContext,
})

function Item({ node, depth }) {
  const { viewConfById, onActivateView, onDeactivateView, onUpdateViewConf } =
    useContext(ViewMenuContext)

  return (
    <ViewControl
      viewSpec={node}
      viewConf={viewConfById[node.id]}
      onDeactivateView={() => onDeactivateView(node.id)}
      onActivateView={(initialConf) => onActivateView(node.id, initialConf)}
      onUpdateViewConf={(nextViewConf) =>
        onUpdateViewConf(node.id, nextViewConf)
      }
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
  viewConfById,
  onActivateView,
  onDeactivateView,
  onUpdateViewConf,
  style,
  ...props
}) {
  return (
    <div style={style}>
      <ViewMenuContext.Provider
        value={{
          viewConfById,
          onActivateView,
          onDeactivateView,
          onUpdateViewConf,
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
