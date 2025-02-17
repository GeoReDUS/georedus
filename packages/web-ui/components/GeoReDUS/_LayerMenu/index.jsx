import { VerticalIconTabs } from '@/components/VerticalIconTabs/VerticalIconTabs'
import { NestedAccordion } from '@/components/NestedAccordion/NestedAccordion'
import { LayerControl, LayerControlContext } from '../LayerControl'
import { Box, Flex } from '@orioro/react-ui-core'
import { Heading } from '@radix-ui/themes'
import styled from 'styled-components'
import { LAYER_TABS } from './data'

const LayerControlList = styled(Flex)`
  > * + * {
    border-top: 1px solid var(--gray-3);
  }
`

function _prepareNodes(nodes) {
  return nodes.map((node) => {
    if (node.children) {
      return {
        ...node,
        children: Array.isArray(node.children)
          ? _prepareNodes(node.children)
          : node.children,
      }
    } else if (node.layers) {
      return {
        ...node,
        children: (
          <LayerControlList direction="column">
            {node.layers.map((layer, index) => (
              <LayerControl key={layer.id || index} layer={layer} />
            ))}
          </LayerControlList>
        ),
      }
    } else {
      return node
    }
  })
}

function LayerTabContent({ tab }) {
  return (
    <Flex
      direction="column"
      style={{
        backgroundColor: 'white',
      }}
    >
      <Flex
        direction="row"
        alignItems="center"
        p="3"
        height={'80px'}
        style={{
          backgroundColor: 'var(--gray-2)',
        }}
      >
        <Heading as="h2" size="5">
          {tab.label}
        </Heading>
      </Flex>
      <NestedAccordion id={`menu_${tab.id}`} nodes={_prepareNodes(tab.nodes)} />
    </Flex>
  )
}

export function LayerMenu({
  tabs = LAYER_TABS,
  activeTabId,
  onSetActiveTabId,
  activeLayers,
  onSetActiveLayers,
  ...props
}) {
  return (
    <LayerControlContext.Provider
      value={{
        activeLayers,
        onSetActiveLayers,
      }}
    >
      <VerticalIconTabs
        activeTabId={activeTabId}
        onSetActiveTabId={onSetActiveTabId}
        tabs={tabs.map((tab) => ({
          ...tab,
          content: <LayerTabContent tab={tab} />,
        }))}
        {...props}
      />
    </LayerControlContext.Provider>
  )
}
