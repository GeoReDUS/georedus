import { Flex } from '@orioro/react-ui-core'
import { GEOREDUS_LABELED_COLORS, GEOREDUS_LABELED_SAFE_COLORS } from '../../../util/colorSchemes'
import { SVG_PATTERNS } from '@orioro/react-maplibre-util'
import { D3_DIVERGING, D3_SEQUENTIAL, D3_CATEGORICAL, D3_COLOR_SCHEMES } from '../../../util'

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

export const DEFAULT_COLOR_SCHEME_ID = 'schemeOrRd'

const GEOREDUS_CATEGORICAL_SAFE_COLORS = Object.values(GEOREDUS_LABELED_SAFE_COLORS).map(
  (color) => color.value,
)

const GEOREDUS_CATEGORICAL_COLORS = Object.values(GEOREDUS_LABELED_COLORS).map(
  (color) => color.value,
)

const CATEGORICAL_SCHEMES = {
  schemeGeoReDUSSafe: GEOREDUS_CATEGORICAL_SAFE_COLORS,
  schemeGeoReDUS: GEOREDUS_CATEGORICAL_COLORS,
  ...D3_CATEGORICAL,
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

const colorScheme = (schemeAll, isSchemeByK) => {
  return Object.entries(schemeAll).map(([name, scheme]) => {
    const colors = isSchemeByK ? getLargestColorArray(scheme) : scheme

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

export function schemeSelector({ defaultValue, schemeType, clearable = false }) {
  return {
    label: 'Esquema de cores',
    type: 'select',
    clearable: clearable,
    defaultValue: defaultValue || DEFAULT_COLOR_SCHEME_ID,
    options:
      schemeType === 'categorical'
        ? colorScheme(CATEGORICAL_SCHEMES, false)
        : colorScheme(CONTINUOUS_SCHEMES, true),
  }
}

const DEFAULT_OPACITY = 0.5

export function opacitySelector({ defaultValue }) {
  return {
    label: 'Opacidade',
    type: 'select',
    clearable: false,
    defaultValue: defaultValue || DEFAULT_OPACITY,
    options: [
      { value: 0.0001, label: '0%' },
      { value: 0.25, label: '25%' },
      { value: 0.5, label: '50%' },
      { value: 0.75, label: '75%' },
      { value: 1, label: '100%' },
    ],
  }
}
