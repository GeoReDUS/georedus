import { SVG_PATTERNS } from '@orioro/react-maplibre-util'
import { Flex } from '@orioro/react-ui-core'

import {
  svgBgImage,
  getColorSelectorSchema,
  COLOR_OPTIONS,
  FILL_PATTERN_OPTIONS,
  FILL_PATTERN_SOLID,
} from '../util'

export function confSchema(viewSpec, allViewSpecs, context) {
  const styleSpec = viewSpec.style

  return {
    style: {
      color: getColorSelectorSchema(styleSpec.color),
      fillPattern: {
        label: 'Textura',
        type: 'select',
        clearable: false,
        defaultValue: styleSpec.fillPattern || FILL_PATTERN_SOLID,
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
  }
}
