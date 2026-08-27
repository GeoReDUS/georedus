import { colorSelector, lineWidthSelector, opacitySlider } from '../util'

const DEFAULT_LINE_OPACITY = 0.1
export function confSchema(viewSpec, allViewSpecs, context) {
  const styleSpec = viewSpec.style

  const style = {
    classificationMethodType: {
      label: 'Método de classificação',
      type: 'select',
      clearable: false,
      defaultValue:
        viewSpec.style?.lineWidth?.classificationMethod?.type || 'naturalBreaks',
      options: [
        {
          value: 'naturalBreaks',
          label: 'Quebras naturais',
        },
        {
          value: 'quantile',
          label: 'Quantis',
        },
        {
          value: 'equalIntervals',
          label: 'Intervalos Iguais',
        },
      ],
    },
    color: colorSelector('customColor', true),
    opacity: opacitySlider({ defaultValue: DEFAULT_LINE_OPACITY }),
  }

  return {
    style,
  }
}
