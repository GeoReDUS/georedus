import {
  fillPatternSelector,
  categoricalColorSchemeSelector,
  opacitySlider,
  CUSTOM_COLOR_SCHEME,
} from '../util'
import { DEFAULT_FILL_OPACITY } from '../util'

export function confSchema(viewSpec, allViewSpecs, context) {
  const styleSpec = viewSpec.style
  const categories = styleSpec?.categories
  
  return {
    style: {
      colorScheme: categoricalColorSchemeSelector({
        defaultValue: styleSpec?.colorScheme,
        customColor:
          styleSpec?.colorScheme === CUSTOM_COLOR_SCHEME
            ? categories && Array.isArray(categories)
              ? categories.map((cat) => cat.color)
              : true
            : false,
      }),
      fillPattern: fillPatternSelector(),
      opacity: opacitySlider({
        defaultValue:
          typeof viewSpec.style.opacity === 'number'
            ? viewSpec.style.opacity
            : DEFAULT_FILL_OPACITY,
      }),
    },
  }
}
