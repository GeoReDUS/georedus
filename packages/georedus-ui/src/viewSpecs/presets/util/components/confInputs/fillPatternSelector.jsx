import { Flex } from '@orioro/react-ui-core'
import { SVG_PATTERNS } from '@orioro/react-maplibre-util'

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

export function fillPatternSelector(
  _defaultValue = FILL_PATTERN_SOLID,
  props = {},
) {
  return {
    label: 'Textura',
    type: 'select',
    clearable: false,
    defaultValue: _defaultValue,
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
