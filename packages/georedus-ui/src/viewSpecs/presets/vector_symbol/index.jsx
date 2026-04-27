import { Z_OVERLAY_TOP_3000 } from '../../zIndexes'
import { interpolate } from '@orioro/util'
import { resolve } from '@orioro/resolve'

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

export function vector_symbol(
  {
    label,
    symbol = {},
    iconSize = 1,
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

  const _symbol_pattern = {
    legendItemProps: {
      icon: {
        style: {
          backgroundImage: 'url(/georedus/assets/icons/educacao.svg)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          width: '24px',
          height: '24px',
        },
      },
    },
  }

  return {
    ...props,
    label,
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
      [`main_symbol`]: {
        zIndex: Z_OVERLAY_TOP_3000,
        source: 'main',
        'source-layer': source_layer,
        type: 'symbol',
        ...symbol,
        layout: {
          'icon-image': 'educacao',
          'icon-size': iconSize,
          'icon-allow-overlap': true,
          ...(symbol.layout || {}),
        },
        legends: [
          {
            type: 'CategoricalLegend',
            items: [
              {
                label,
                ..._symbol_pattern.legendItemProps,
              },
            ],
          },
        ],
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
