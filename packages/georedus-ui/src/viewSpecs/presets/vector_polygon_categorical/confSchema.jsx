import {
  fillPatternSelector,
  categoricalColorSchemeSelector,
  opacitySlider,
} from '../util'
import { DEFAULT_FILL_OPACITY } from '../util'

export function confSchema(viewSpec, allViewSpecs, context) {
  return {
    style: {
      colorScheme: categoricalColorSchemeSelector({
        defaultValue: viewSpec.style?.colorScheme,
        clearable: viewSpec.style?.colorScheme === null,
      }),
      fillPattern: fillPatternSelector(),
      opacity: opacitySlider({ defaultValue: DEFAULT_FILL_OPACITY }),
    },
  }
}
