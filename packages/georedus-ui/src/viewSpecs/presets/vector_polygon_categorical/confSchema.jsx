import {
  fillPatternSelector,
  categoricalColorSchemeSelector,
  opacitySlider,
  CUSTOM_COLOR_SCHEME,
} from '../util'
import { DEFAULT_FILL_OPACITY } from '../util'

export function confSchema(viewSpec, allViewSpecs, context) {
  return {
    style: {
      colorScheme: categoricalColorSchemeSelector({
        defaultValue: viewSpec.style?.colorScheme,
        customColor: viewSpec.style?.colorScheme === CUSTOM_COLOR_SCHEME,
      }),
      fillPattern: fillPatternSelector(),
      opacity: opacitySlider({ defaultValue: DEFAULT_FILL_OPACITY }),
    },
  }
}
