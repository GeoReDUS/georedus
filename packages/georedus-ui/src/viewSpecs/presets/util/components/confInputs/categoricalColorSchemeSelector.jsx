import { Flex } from '@orioro/react-ui-core'
import { resolveColor } from '../../../../util'
import {
  GEOREDUS_LABELED_COLORS,
  GEOREDUS_LABELED_SAFE_COLORS,
  D3_CATEGORICAL,
} from '../../../../util/colorSchemes'

const GEOREDUS_CATEGORICAL_SAFE_COLORS = Object.values(
  GEOREDUS_LABELED_SAFE_COLORS,
).map((color) => color.value)

const GEOREDUS_CATEGORICAL_COLORS = Object.values(GEOREDUS_LABELED_COLORS).map(
  (color) => color.value,
)

const CATEGORICAL_SCHEMES = {
  schemeGeoReDUSSafe: GEOREDUS_CATEGORICAL_SAFE_COLORS,
  schemeGeoReDUS: GEOREDUS_CATEGORICAL_COLORS,
  ...D3_CATEGORICAL,
}

function renderColorScheme(scheme) {
  return (
    <Flex direction="row" gap="2" alignItems="center">
      <div style={{ display: 'flex', gap: '2px' }}>
        {scheme.map((color, idx) => (
          <div
            key={idx}
            style={{
              width: 15,
              height: 15,
              backgroundColor: resolveColor(color),
              border: 'none',
            }}
          />
        ))}
      </div>
    </Flex>
  )
}

export const CUSTOM_COLOR_SCHEME = 'customColorScheme'

export function categoricalColorSchemeSelector({
  defaultValue = 'schemeGeoReDUSSafe',
  customColor = false,
}) {
  return {
    label: 'Esquema de cores',
    type: 'select',
    clearable: false,
    defaultValue,
    options: [
      ...(Array.isArray(customColor)
        ? [
            {
              value: CUSTOM_COLOR_SCHEME,
              label: renderColorScheme(customColor),
            },
          ]
        : customColor === true
          ? [{ value: CUSTOM_COLOR_SCHEME, label: 'Cores Customizadas' }]
          : []),
      ...Object.entries(CATEGORICAL_SCHEMES).map(([name, scheme]) => {
        return {
          value: name,
          label: renderColorScheme(scheme),
        }
      }),
    ],
  }
}
