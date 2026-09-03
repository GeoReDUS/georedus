import { colorSelector } from '../util'

export function confSchema(viewSpec, allViewSpecs, context) {
  const styleSpec = viewSpec.style

  return {
    style: {
      color: colorSelector(styleSpec.color),
    },
  }
}
