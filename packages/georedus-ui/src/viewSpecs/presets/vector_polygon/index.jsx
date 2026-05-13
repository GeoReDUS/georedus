import { resolveColor } from '../../util'
import { SVG_PATTERNS } from '@orioro/react-maplibre-util'
import { Z_OVERLAY_BASE_1000 } from '../../zIndexes'
import { interpolate } from '@orioro/util'
import { resolve } from '@orioro/resolve'
import { Flex } from '@orioro/react-ui-core'

const SOLID = 'solid'
const DEFAULT_FILL_OPACITY = 0.5

const COLOR_OPTIONS = [
  { label: 'Azul Claro', value: '#a6cee3' },
  { label: 'Azul', value: '#1f78b4' },
  { label: 'Verde Claro', value: '#b2df8a' },
  { label: 'Verde', value: '#33a02c' },
  { label: 'Vermelho Claro', value: '#fb9a99' },
  { label: 'Vermelho', value: '#e31a1c' },
  { label: 'Laranja Claro', value: '#fdbf6f' },
  { label: 'Laranja', value: '#ff7f00' },
  { label: 'Roxo Claro', value: '#cab2d6' },
  { label: 'Roxo', value: '#6a3d9a' },
  { label: 'Amarelo Claro', value: '#ffff99' },
  { label: 'Marrom', value: '#b15928' },
]

const FILL_PATTERN_OPTIONS = [
  { label: 'Preenchido', value: SOLID },
  { label: 'Quadrados', value: 'squares_1' },
  { label: 'Triângulos', value: 'triangles_1' },
  { label: 'Diamantes', value: 'diamonds_1' },
  { label: 'Cruz', value: 'cross_1' },
  { label: 'Mosaico 1', value: 'mosaic_1' },
  { label: 'Mosaico 2', value: 'mosaic_2' },
  { label: 'Ondas', value: 'waves_1' },
  { label: 'Círculos', value: 'circles_1' },
  { label: 'Linhas', value: 'lines_1' },
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
function svgBgImage(svg) {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

export function vector_polygon(
  {
    label,
    color,
    line = {},
    fill = {},
    tiles,
    source_layer,
    sources = {},
    layers = {},
    fill_pattern,
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

  const _legend = resolve.fn(_color, (_resolvedColor, ctx) => {
    const resolvedFillPattern =
      ctx.view?.conf?.style?.fillPattern || fill_pattern

    const legendItemProps =
      resolvedFillPattern || line
        ? {
            box: {
              style: {
                borderColor:
                  line?.paint && line.paint['line-color']
                    ? line.paint['line-color']
                    : _resolvedColor,
                borderStyle:
                  line?.paint && line.paint['line-dasharray']
                    ? 'dashed'
                    : 'solid',
                borderWidth: '1px',
                ...(resolvedFillPattern && resolvedFillPattern !== SOLID
                  ? {
                      backgroundColor: 'transparent',
                      backgroundImage:
                        resolvedFillPattern &&
                        typeof SVG_PATTERNS[resolvedFillPattern] === 'function'
                          ? svgBgImage(
                              SVG_PATTERNS[resolvedFillPattern]({
                                stroke: _resolvedColor,
                                scale: '0.25',
                              }),
                            )
                          : '',
                    }
                  : {}),
              },
            },
          }
        : {}

    return {
      type: 'CategoricalLegend',
      items: [
        {
          label,
          color: _color,
          ...legendItemProps,
        },
      ],
    }
  })

  const _fillPaint = resolve.fn(_color, (_resolvedColor, ctx) => {
    const resolvedFillPattern =
      ctx.view?.conf?.style?.fillPattern || fill_pattern
    const resolvedFillPatternStr =
      resolvedFillPattern && resolvedFillPattern !== SOLID
        ? `${resolvedFillPattern}({ stroke: "${_resolvedColor}", scale: 0.5 })`
        : null

    return {
      'fill-opacity':
        fill.paint && fill.paint['fill-opacity']
          ? fill.paint['fill-opacity']
          : DEFAULT_FILL_OPACITY,
      'fill-color': _color,
      ...fill['paint'],
      ...(resolvedFillPatternStr
        ? { 'fill-pattern': resolvedFillPatternStr }
        : {}),
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
        fillPattern: {
          label: 'Textura',
          type: 'select',
          clearable: false,
          defaultValue: fill_pattern || SOLID,
          options: FILL_PATTERN_OPTIONS.map((opt) => {
            const pattern =
              opt.value === SOLID
                ? null
                : typeof SVG_PATTERNS[opt.value] === 'function'
                  ? svgBgImage(
                      SVG_PATTERNS[opt.value]({
                        scale: '0.25',
                      }),
                    )
                  : null
            return {
              ...opt,
              label: (
                <Flex direction="row" alignItems="center" gap="2">
                  <div
                    style={{
                      width: 15,
                      height: 15,
                      ...(pattern
                        ? { backgroundImage: pattern }
                        : { backgroundColor: '#ccc' }),
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
        zIndex: Z_OVERLAY_BASE_1000,
        source: 'main',
        'source-layer': source_layer,
        type: 'line',
        ...line,
        paint: {
          'line-color': _color,
          ...line.paint,
        },
      },
      [`main_fill`]: {
        zIndex: Z_OVERLAY_BASE_1000,
        source: 'main',
        'source-layer': source_layer,
        type: 'fill',
        ...fill,
        layout: {
          ...fill['layout'],
        },
        paint: _fillPaint,
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
