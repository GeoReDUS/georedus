import { fillPatternSelector, categoricalColorSchemeSelector } from '../util'
import { DEFAULT_FILL_OPACITY } from '../util'

export function confSchema(viewSpec, allViewSpecs, context) {
  return {
    style: {
      fillPattern: fillPatternSelector(),
      colorScheme: categoricalColorSchemeSelector({
        defaultValue: viewSpec.style?.colorScheme,
        clearable: viewSpec.style?.colorScheme === null,
      }),
      opacity: {
        type: 'slider',
        label: 'Opacidade da camada',
        size: '1',
        min: 0,
        max: 1,
        step: 0.01,
        defaultValue: DEFAULT_FILL_OPACITY,
      },
    },
  }
}
