import { colorSelector, linePatternSelector, lineWidthSelector } from '../util'

export function confSchema(viewSpec, allViewSpecs, context) {
  const styleSpec = viewSpec.style

  const style = {
    linePattern: linePatternSelector({ defaultValue: styleSpec?.linePattern }),
  }

  if (!styleSpec?.lineWidth || typeof styleSpec?.lineWidth === 'number') {
    style.lineWidth = lineWidthSelector({ defaultValue: styleSpec?.lineWidth })
  }

  return {
    style,
  }
}
