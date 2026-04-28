import { schemeCategory10 } from 'd3-scale-chromatic'
import { circles_1, waves_1 } from '@orioro/react-maplibre-util'
import { Z_OVERLAY_BASE_1000, Z_OVERLAY_TOP_3000 } from '../../zIndexes'
import { interpolate } from '@orioro/util'
import { resolve } from '@orioro/resolve'
import { resolveColor } from '../../util'
import { Flex } from '@orioro/react-ui-core'
import { COLOR_OPTIONS } from '../color_options/index'
import { _resolveSourceBounds } from '../cem_censo/2010_2022/metadata'

function _parseTiles(tiles, context) {
  tiles = Array.isArray(tiles)
    ? tiles
    : typeof tiles === 'string'
      ? [tiles]
      : null

  if (!tiles) {
    throw new Error(`tiles is required`)
  }

  return tiles.map((tileSrcUrl) => interpolate(tileSrcUrl, context))
}

export function vector_circle(
  {
    label,
    circle = {},
    color,
    tiles,
    source_layer,
    sources = {},
    layers = {},
    ...props
  },
  allViewSpecs,
  context,
) {
  if (!source_layer) {
    throw new Error('source_layer must be defined')
  }

  const _initialColor = resolveColor(color)
  const _color = resolve.fn(
    (ctx) => resolveColor(ctx.view?.conf?.style?.color) || _initialColor,
  )

  const _legend = resolve.fn(_color, (_resolvedColor) => {
    return {
      type: 'CategoricalLegend',
      items: [
        {
          label,
          box: {
            style: {
              backgroundColor: _resolvedColor,
              border: '1px solid black',
              borderRadius: '30px',
            }
          }
        },
      ],
    }
  })

  return {
    ...props,
    label,
    confSchema: {
      style: {
        color: {
          label: 'Cor',
          helperText: 'Selecione a cor para a camada',
          type: 'select',
          clearable: false,
          defaultValue: _initialColor,
          options: COLOR_OPTIONS.map((opt) => ({
            ...opt,
            label: (
              <Flex direction="row" alignItems="center" gap="2">
                <div
                  style={{
                    width: '15px',
                    height: '15px',
                    backgroundColor: opt.value,
                  }}
                />
                <div>{opt.label}</div>
              </Flex>
            ),
          })),
        },
      },
    },
    metadata: {},
    sources: {
      main: {
        promoteId: 'id',
        type: 'vector',
        tiles: _parseTiles(tiles, context),
      },
      ...sources,
    },
    layers: {
      [`main_circle`]: {
        zIndex: Z_OVERLAY_TOP_3000,
        source: 'main',
        'source-layer': source_layer,
        type: 'circle',
        ...circle,
        paint: {
          'circle-radius': 8,
          'circle-color': _color,
          'circle-opacity': 1,
          'circle-stroke-color': '#000000',
          'circle-stroke-width': 1,
          ...(circle.paint || {}),
        },
        legends: [_legend],
        tooltip: {
          title: [
            '$literal',
            resolve.fn((ctx) => {
              return ctx?.feature?.properties?.name
            }),
          ],
          entries: [
            '$literal',
            resolve.fn((ctx) => {
              return typeof ctx.feature?.properties === 'object'
                ? Object.entries(ctx.feature.properties)
                : []
            }),
          ],
        },
      },
      ...layers,
    },
  }
}
