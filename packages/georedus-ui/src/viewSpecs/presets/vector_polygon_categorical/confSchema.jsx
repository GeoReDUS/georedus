import { fillPatternSelector, schemeSelector, opacitySelector } from '../util'
import { DEFAULT_FILL_OPACITY } from '../util'

export function confSchema(viewSpec, allViewSpecs, context) {
  return {
    style: {
      fillPattern: fillPatternSelector(),
      colorScheme: schemeSelector({
        defaultValue: viewSpec.style?.colorScheme || 'schemeGeoReDUSSafe',
        schemeType: 'categorical',
      }),
      opacity: opacitySelector({ defaultValue: DEFAULT_FILL_OPACITY }),
    },
  }
}
