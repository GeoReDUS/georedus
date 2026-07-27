import { DEFAULT_COLOR_SCHEME_ID } from './parseStyleSpec'
import { continuousColorSchemeSelector } from '../util/components/confInputs'
import { DEFAULT_FILL_OPACITY, opacitySlider } from '../util'

export function confSchema(viewSpec, allViewSpecs, context) {
  return {
    style: {
      classificationMethodType: {
        label: 'Método de classificação',
        type: 'select',
        clearable: false,
        defaultValue:
          viewSpec.style?.classificationMethod?.type || 'naturalBreaks',
        options: [
          {
            value: 'naturalBreaks',
            label: 'Quebras naturais',
          },
          {
            value: 'quantile',
            label: 'Quantis',
          },
        ],
      },
      colorScheme: continuousColorSchemeSelector({
        defaultValue: viewSpec.style?.colorScheme || DEFAULT_COLOR_SCHEME_ID,
      }),
      opacity: opacitySlider({ defaultValue: DEFAULT_FILL_OPACITY }),
    },
  }
}
