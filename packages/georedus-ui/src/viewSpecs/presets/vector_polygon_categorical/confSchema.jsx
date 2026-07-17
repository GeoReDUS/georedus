import { fillPatternSelector, schemeSelector, opacitySelector } from '../util'
import { DEFAULT_FILL_OPACITY } from '../util'

export function confSchema(viewSpec, allViewSpecs, context) {
  return {
    style: {
      fillPattern: fillPatternSelector(),
      colorScheme: schemeSelector({
        defaultValue: viewSpec.style?.colorScheme,
        schemeType: 'categorical',
        clearable: viewSpec.style?.colorScheme === null
      }),
      opacity: opacitySelector({ defaultValue: DEFAULT_FILL_OPACITY }),
    },
  }
}
