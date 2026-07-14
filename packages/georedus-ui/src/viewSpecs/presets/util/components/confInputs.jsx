import { Flex } from '@orioro/react-ui-core'
import { GEOREDUS_LABELED_COLORS } from '../../../util/colorSchemes'
import { SVG_PATTERNS } from '@orioro/react-maplibre-util'
import { D3_DIVERGING, D3_SEQUENTIAL, D3_COLOR_SCHEMES } from '../../../util'

export const COLOR_OPTIONS = Object.values(GEOREDUS_LABELED_COLORS)

export function colorSelector(_initialColor) {
  return {
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
  }
}

export function svgBgImage(svg) {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

export const FILL_PATTERN_SOLID = 'solid'

export const FILL_PATTERN_OPTIONS = [
  { label: 'Preenchido', value: FILL_PATTERN_SOLID },
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

export function fillPatternSelector(props = {}) {
  return {
    label: 'Textura',
    type: 'select',
    clearable: false,
    defaultValue: FILL_PATTERN_SOLID,
    options: FILL_PATTERN_OPTIONS.map((opt) => {
      const pattern =
        opt.value === FILL_PATTERN_SOLID
          ? null
          : svgBgImage(
              SVG_PATTERNS[opt.value]({
                scale: '0.25',
              }),
            )
      return {
        ...opt,
        label: (
          <Flex direction="row" alignItems="center" gap="2">
            <div
              style={{
                width: 15,
                height: 15,
                border: '1px solid #aaa',
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
    ...props,
  }
}

<<<<<<< HEAD
export const DEFAULT_COLOR_SCHEME_ID = 'schemeOrRd'

const CATEGORICAL_SCHEMES = {
  ...GEOREDUS_LABELED_COLORS,
}

const continuousIds = [
  ...Object.keys(D3_SEQUENTIAL),
  ...Object.keys(D3_SEQUENTIAL).map((id) => `-${id}`),
  ...Object.keys(D3_DIVERGING),
  ...Object.keys(D3_DIVERGING).map((id) => `-${id}`),
]

const CONTINUOUS_SCHEMES = Object.fromEntries(
  continuousIds.map((id) => [id, D3_COLOR_SCHEMES[id]]),
)

const getLargestColorArray = (scheme) => {
  if ('colors' in scheme) {
    return scheme.colors
  }
  return scheme.scalesByK[scheme.maxK]
}

const colorScheme = (scheme) => {
  return Object.entries(scheme).map(([name, scheme]) => {
    const colors = getLargestColorArray(scheme)

    return {
      value: name,
      label: (
        <Flex direction="row" gap="2" alignItems="center">
          <div style={{ display: 'flex', gap: '2px' }}>
            {colors.map((color, idx) => (
              <div
                key={idx}
                style={{
                  width: 15,
                  height: 15,
                  backgroundColor: color,
                  border: 'none',
                }}
              />
            ))}
          </div>
        </Flex>
      ),
    }
  })
}

export function schemeSelector({ defaultValue, schemeType }) {
  return {
    label: 'Esquema de cores',
    type: 'select',
    clearable: false,
    defaultValue: defaultValue || DEFAULT_COLOR_SCHEME_ID,
    options:
      schemeType === 'categorical'
        ? colorScheme(CATEGORICAL_SCHEMES)
        : colorScheme(CONTINUOUS_SCHEMES),
  }
}
=======
export const LINE_PATTERN_SOLID = 'solid'

export const LINE_PATTERN_OPTIONS = [
  { label: 'Sólido', value: 'solid' },
  { label: 'Tracejado', value: 'dashed' },
  { label: 'Pontilhado', value: 'dotted' },
]

export function linePatternSelector({defaultValue = LINE_PATTERN_SOLID} = {}) {
  return {
    label: 'Padrão da linha',
    helperText: 'Selecione o padrão de linha para a camada',
    type: 'select',
    clearable: false,
    defaultValue: defaultValue,
    options: LINE_PATTERN_OPTIONS.map((opt) => {
      return {
        ...opt,
        label: (
          <Flex direction="row" alignItems="center" gap="2">
            <div
              style={{
                width: 15,
                height: 0,
                borderTop: `2px ${opt.value} black`,
              }}
            />
            <div> {opt.label}</div>
          </Flex>
        ),
      }
    }),
  }
}


export const LINE_WIDTH_1 = 1

export const LINE_WIDTH_OPTIONS = Array.from({ length: 5 }, (_, i) => i + 1).map((v) => ({
  label: `${v}px`,
  value: v,
}))

export function lineWidthSelector({defaultValue = LINE_WIDTH_1} = {}) {
  return {
    label: 'Espessura da linha',
    helperText: 'Selecione a expessura da linha para a camada',
    type: 'select',
    clearable: false,
    defaultValue: defaultValue,
    options: LINE_WIDTH_OPTIONS.map((opt) => {
      return {
        ...opt,
        label: (
          <Flex direction="row" alignItems="center" gap="2">
            <div
              style={{
                width: 15,
                height: 0,
                borderTop: `${opt.value}px solid black`,
              }}
            />
            <div> {opt.label}</div>
          </Flex>
        ),
      }
    }), 
  }
}
>>>>>>> 0bb9cc64db4a87695421d3c9688b8d3808c9c1d9
