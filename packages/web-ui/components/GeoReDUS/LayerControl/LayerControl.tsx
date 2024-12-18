import { DropdownMenu } from '@/components/Menu'
import { mdiSquareEditOutline } from '@mdi/js'
import Icon from '@mdi/react'
import { Flex, TextEllipsis } from '@orioro/react-ui-core'
import { Heading, IconButton, Switch, Tooltip } from '@radix-ui/themes'
import { createContext, useContext, useMemo } from 'react'
import styled from 'styled-components'

type Layer = {
  label: string
  active: boolean
}

export type LayerControlProps = {
  layer: Layer
  onSetLayer: (nextLayer: Layer) => any
}

const Container = styled(Flex)``

const NeutralButton = styled.button`
  all: unset;
  flex-grow: 1;

  cursor: pointer;
  &:hover {
    background-color: var(--blue-5);
  }
`

export const LayerControlContext = createContext({
  activeLayers: [],
  onSetActiveLayers: () => {},
})

function _collectVariants(variantTree) {
  return variantTree.reduce((acc, node) => {
    if (Array.isArray(node.options)) {
      // not a variant
      return [...acc, ..._collectVariants(node.options)]
    } else {
      // is a variant
      return [...acc, node]
    }
  }, [])
}

export function LayerControl({ layer, onSetLayer }: LayerControlProps) {
  const { activeLayers, onSetActiveLayers } = useContext(LayerControlContext)

  const allVariants = useMemo(() => {
    return _collectVariants(layer.variants || [])
  }, [layer])

  function _removeRootLayerAndVariants(activeLayers) {
    return activeLayers.filter((activeLayer) => {
      const isRootLayer = activeLayer.id === layer.id

      if (isRootLayer) {
        return false
      }

      const isVariantLayer = allVariants.some(
        (variant) => variant.id === activeLayer.id,
      )

      if (isVariantLayer) {
        return false
      }

      return true
    })
  }

  return (
    <Container direction="row" gap="3" py="3" alignItems="center">
      <NeutralButton
        onClick={() =>
          onSetLayer({
            ...layer,
            active: !layer.active,
          })
        }
      >
        <Heading
          as="h3"
          size="2"
          style={{
            fontWeight: 'normal',
          }}
        >
          <TextEllipsis maxLines={2}>{layer.label}</TextEllipsis>
        </Heading>
      </NeutralButton>

      <DropdownMenu
        options={[
          // {
          //   label: 'Recortes sociais',
          //   options: layer.variants,
          // },
          {
            label: layer.label,
            value: layer.id,
          },
          ...(layer.variants || []),
          {
            type: 'separator',
          },
          {
            label: 'Configurações da camada',
            onClick: () => {
              alert('config')
              return
            },
          },
        ]}
        onSelect={(layerVariant) => {
          onSetActiveLayers([
            ..._removeRootLayerAndVariants(activeLayers),
            layerVariant,
          ])
        }}
      >
        <IconButton radius="full" variant="ghost">
          <Tooltip content="Test">
            <Icon path={mdiSquareEditOutline} size="16px" />
          </Tooltip>
        </IconButton>
      </DropdownMenu>

      <Switch
        radius="full"
        checked={activeLayers.some(
          (activeLayer) =>
            activeLayer.id === layer.id ||
            allVariants.some((variant) => variant.id === activeLayer.id),
        )}
        onCheckedChange={(nextLayerActive) => {
          if (nextLayerActive) {
            onSetActiveLayers([...activeLayers, layer])
          } else {
            onSetActiveLayers(_removeRootLayerAndVariants(activeLayers))
          }
        }}
      />
    </Container>
  )
}
