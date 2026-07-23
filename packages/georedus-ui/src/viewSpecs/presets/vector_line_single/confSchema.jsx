import { colorSelector, linePatternSelector, lineWidthSelector } from '../util'

export function confSchema(viewSpec, allViewSpecs, context) {
  const styleSpec = viewSpec.style

  return {
    style: {
      color: colorSelector(styleSpec.color),
      linePattern: linePatternSelector({ defaultValue: styleSpec.linePattern }),
      lineWidth: lineWidthSelector({ defaultValue: styleSpec.lineWidth }),
    },
  }
}
