import { opacitySlider } from '../util'

export function confSchema(viewSpec, allViewSpecs, context) {
  const styleSpec = viewSpec.style

  return {
    style: {
      opacity: opacitySlider({
        defaultValue:
          typeof styleSpec.opacity === 'number' ? styleSpec.opacity : 1,
      }),
    },
  }
}
