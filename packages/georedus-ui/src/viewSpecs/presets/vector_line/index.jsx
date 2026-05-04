import { schemeCategory10 } from 'd3-scale-chromatic'
import { waves_1 } from '@orioro/react-maplibre-util'
import { Z_OVERLAY_BASE_1000, Z_OVERLAY_MIDDLE_2000 } from '../../zIndexes'
import { interpolate } from '@orioro/util'
import { resolve } from '@orioro/resolve'
import { resolveColor } from '../../util'
import { Flex } from '@orioro/react-ui-core'
import { getColorOptions } from '../util/color_options/index'

const LINE_PATTERN_OPTIONS = [
  { label: 'Continua', value: 'line' },
  { label: 'Tracejada', value: 'dashed' },
]

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

export function vector_line(
  {
    label,
    line = {},
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

  const _initialLinePattern =
    line.paint && line.paint['line-dasharray'] ? 'dashed' : 'line'

  const _linePattern = resolve.fn(_color, (_resolvedColor, ctx) => {
    const resolvedLinePattern =
      ctx.view?.conf?.style?.linePattern || _initialLinePattern

    return {
      'line-width': 1,
      'line-color': _color,
      ...(line.paint || {}),
      ...(resolvedLinePattern === 'dashed' ? { 'line-dasharray': [2, 2] } : {}),
    }
  })

  const _legend = resolve.fn(_color, (_resolvedColor, ctx) => {
    return {
      type: 'CategoricalLegend',
      items: [
        {
          label,
          box: {
            style: {
              height: 0,
              borderColor: _resolvedColor,
              borderStyle:
                ctx.view?.conf?.style?.linePattern || _initialLinePattern,
              borderWidth: '1px',
            },
          },
        },
      ],
    }
  })

  return {
    ...props,
    label,
    confSchema: {
      style: {
        color: getColorOptions(_initialColor),
        linePattern: {
          label: 'Linha',
          type: 'select',
          clearable: false,
          defaultValue: _initialLinePattern || 'line',
          options: LINE_PATTERN_OPTIONS.map((opt) => {
            return {
              ...opt,
              label: (
                <Flex direction="row" alignItems="center" gap="2">
                  <div
                    style={{
                      width: 15,
                      height: 0,
                      borderStyle: opt.value === 'line' ? 'solid' : 'dashed',
                      borderWidth: 1,
                    }}
                  />
                  <div> {opt.label}</div>
                </Flex>
              ),
            }
          }),
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
      [`main_line`]: {
        zIndex: Z_OVERLAY_MIDDLE_2000,
        source: 'main',
        'source-layer': source_layer,
        type: 'line',
        ...line,
        paint: _linePattern,
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
