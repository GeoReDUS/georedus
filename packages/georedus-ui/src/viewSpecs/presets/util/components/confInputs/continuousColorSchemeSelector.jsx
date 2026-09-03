import { Flex } from '@orioro/react-ui-core'
import {
  D3_DIVERGING,
  D3_SEQUENTIAL,
  D3_COLOR_SCHEMES,
} from '../../../../util/colorSchemes'

const continuousIds = [
  ...Object.keys(D3_SEQUENTIAL),
  ...Object.keys(D3_SEQUENTIAL).map((id) => `-${id}`),
  ...Object.keys(D3_DIVERGING),
  ...Object.keys(D3_DIVERGING).map((id) => `-${id}`),
]

const CONTINUOUS_SCHEMES = Object.fromEntries(
  continuousIds.map((id) => [id, D3_COLOR_SCHEMES[id]]),
)

export function continuousColorSchemeSelector({ defaultValue = 'schemeOrRd' }) {
  return {
    label: 'Esquema de cores',
    type: 'select',
    clearable: false,
    defaultValue,
    options: Object.entries(CONTINUOUS_SCHEMES).map(([name, scheme]) => {
      const colors = scheme.scalesByK[scheme.maxK]
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
    }),
  }
}
