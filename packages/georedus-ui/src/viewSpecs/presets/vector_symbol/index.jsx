import { Z_OVERLAY_TOP_3000 } from '../../zIndexes'
import { interpolate } from '@orioro/util'
import { resolve } from '@orioro/resolve'

// Educacao SVG icon - stored as a full SVG string
// Export this so consumers can pass it to GeoReDUS's svgImages prop
export const EDUCACAO_SVG = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 73.31 66.04" width="32" height="32">
  <g>
    <polygon fill="#384EA0" stroke="#384EA0" stroke-width="2.5" stroke-miterlimit="10" points="10.53,28.71 10.75,48.58 36.21,62.51 62.56,47.7 62.93,28.71"/>
    <polygon fill="#F5F5F5" stroke="#384EA0" stroke-width="2.5" points="37.1,7.3 2.44,24.05 36.21,42.13 70.87,23.16"/>
    <line fill="none" stroke="#F5F5F5" stroke-width="3.298" x1="62.93" y1="27.44" x2="10.53" y2="27.44"/>
    <line fill="none" stroke="#F5F5F5" stroke-width="3.298" x1="67.27" y1="23.2" x2="67.27" y2="44.26"/>
  </g>
</svg>`

// Default svgImages that should be passed to GeoReDUS when using vector_symbol viewSpec
export const VECTOR_SYMBOL_SVG_IMAGES = {
  educacao: EDUCACAO_SVG,
}

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
          'icon-padding': 0,
          ...(symbol.layout || {}),
        },
        paint: {
          ...(symbol.paint || {}),
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
