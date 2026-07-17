import { colorSelector, fillPatternSelector, opacitySelector } from '../util'
import { DEFAULT_FILL_OPACITY } from '../util'

export function confSchema(viewSpec, allViewSpecs, context) {
  const styleSpec = viewSpec.style

  return {
    style: {
      color: colorSelector(styleSpec.color),
      fillPattern: fillPatternSelector(),
      opacity: opacitySelector(styleSpec.opacity || DEFAULT_FILL_OPACITY),
    },
  }
}
