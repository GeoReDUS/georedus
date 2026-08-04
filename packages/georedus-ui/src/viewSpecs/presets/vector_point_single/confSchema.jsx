import { colorSelector, opacitySlider } from '../util'

export function confSchema(viewSpec, allViewSpecs, context) {
  const styleSpec = viewSpec.style

  return {
    style: {
      color: colorSelector(styleSpec.color),
      opacity: opacitySlider({
        defaultValue:
          typeof viewSpec.style.opacity === 'number'
            ? viewSpec.style.opacity
            : 1,
      }),
    },
  }
}
