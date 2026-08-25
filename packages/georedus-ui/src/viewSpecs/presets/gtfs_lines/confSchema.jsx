import { colorSelector, linePatternSelector, lineWidthSelector, opacitySlider } from '../util'

const DEFAULT_LINE_OPACITY = 0.1
export function confSchema(viewSpec, allViewSpecs, context) {
  const styleSpec = viewSpec.style

  const style = {
    linePattern: linePatternSelector({ defaultValue: styleSpec?.linePattern }),
    opacity: opacitySlider({ defaultValue: DEFAULT_LINE_OPACITY })
  }

  if (!styleSpec?.lineWidth || typeof styleSpec?.lineWidth === 'number') {
    style.lineWidth = lineWidthSelector({ defaultValue: styleSpec?.lineWidth })
  } else if (styleSpec?.lineWidth?.valueKey) {
    style.classificationMethodType = {
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
          value: 'linear',
          label: 'Linear',
        },
      ],
    }
  }

  return {
    style,
  }
}
