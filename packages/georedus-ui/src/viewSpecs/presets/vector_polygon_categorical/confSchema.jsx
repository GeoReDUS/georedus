import {
  fillPatternSelector,
  categoricalColorSchemeSelector,
  opacitySlider,
} from '../util'
import { DEFAULT_FILL_OPACITY } from '../util'

export function confSchema(viewSpec, allViewSpecs, context) {
  return {
    style: {
      fillPattern: fillPatternSelector(),
      colorScheme: categoricalColorSchemeSelector({
        defaultValue: viewSpec.style?.colorScheme,
        clearable: viewSpec.style?.colorScheme === null,
      }),
      opacity: opacitySlider({
        defaultValue:
          typeof viewSpec.style.opacity === 'number'
            ? viewSpec.style.opacity
            : DEFAULT_FILL_OPACITY,
      }),
    },
  }
}
