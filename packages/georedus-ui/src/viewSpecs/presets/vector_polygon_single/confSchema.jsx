import { colorSelector, fillPatternSelector, opacitySlider } from '../util'
import { DEFAULT_FILL_OPACITY } from '../util'

export function confSchema(viewSpec, allViewSpecs, context) {
  const styleSpec = viewSpec.style

  return {
    style: {
      color: colorSelector(styleSpec.color),
      fillPattern: fillPatternSelector(styleSpec.fillPattern),
      opacity: opacitySlider({ defaultValue: DEFAULT_FILL_OPACITY }),
    },
  }
}
