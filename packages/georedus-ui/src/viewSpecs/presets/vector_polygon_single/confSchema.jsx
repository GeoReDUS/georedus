import { colorSelector, fillPatternSelector, opacitySelector } from '../util'
import { DEFAULT_FILL_OPACITY } from '../util'

export function confSchema(viewSpec, allViewSpecs, context) {
  const styleSpec = viewSpec.style

  return {
    style: {
      color: colorSelector(styleSpec.color),
      fillPattern: fillPatternSelector(styleSpec.fillPattern),
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
